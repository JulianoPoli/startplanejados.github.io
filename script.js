/* =========================================================
   PORTFÓLIO
   ========================================================= */

const gallery = document.getElementById("projectGallery");
const filters = document.getElementById("projectFilters");

const lightbox = document.getElementById("projectLightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxTitle = document.getElementById("lightboxTitle");
const lightboxCategory = document.getElementById("lightboxCategory");
const lightboxClose = document.getElementById("lightboxClose");

let projects = [];
let currentFilter = "todos";


/* =========================================================
   INTERSECTION OBSERVER
   ========================================================= */

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12
  }
);


/* =========================================================
   CARREGAR PROJETOS
   ========================================================= */

async function loadProjects() {
  try {
    const response = await fetch("imagens/images.json");

    if (!response.ok) {
      throw new Error(
        `Erro HTTP ${response.status} ao carregar images.json`
      );
    }

    projects = await response.json();

    if (!Array.isArray(projects)) {
      throw new Error("images.json não contém uma lista de projetos.");
    }

    renderProjects();

  } catch (error) {
    console.error("Erro ao carregar portfólio:", error);

    if (gallery) {
      gallery.innerHTML = `
        <div class="empty-projects">
          <p>Não foi possível carregar os projetos.</p>
        </div>
      `;
    }
  }
}


/* =========================================================
   RENDERIZAR PROJETOS
   ========================================================= */

function renderProjects() {

  if (!gallery) return;

  gallery.innerHTML = "";

  const filteredProjects =
    currentFilter === "todos"
      ? projects
      : projects.filter((project) => {
          const category =
            project.category ||
            project.categoria ||
            "";

          return category.toLowerCase() === currentFilter.toLowerCase();
        });


  /* -------------------------------------------------------
     Nenhum projeto
     ------------------------------------------------------- */

  if (!filteredProjects.length) {

    gallery.innerHTML = `
      <div class="empty-projects">
        <p>Nenhum projeto encontrado.</p>
      </div>
    `;

    return;
  }


  /* -------------------------------------------------------
     Criar cards
     ------------------------------------------------------- */

  filteredProjects.forEach((project, index) => {

    const figure = document.createElement("figure");


    /*
     * Aceita:
     *
     * src: "imagens/residencial/projeto-01.jpg"
     *
     * OU:
     *
     * imagem: "projeto-01.jpg"
     *
     * Caso seja utilizado "imagem", o caminho será
     * montado automaticamente.
     */

    const imageSource = getImageSource(project);

    const title =
      project.title ||
      project.titulo ||
      "Projeto";


    const category =
      project.category ||
      project.categoria ||
      "projeto";


    /* -----------------------------------------------------
       Classe do card
       ----------------------------------------------------- */

    figure.className =
      `project ${index === 0 ? "large" : ""}`;


    /*
     * IMPORTANTE:
     *
     * Não colocamos "reveal" aqui.
     *
     * Os projetos são criados dinamicamente depois que
     * a página já carregou.
     *
     * Isso evita que o card fique com opacity: 0 caso
     * o IntersectionObserver não consiga observá-lo.
     */

    figure.innerHTML = `
      <img
        src="${imageSource}"
        alt="${escapeHtml(title)}"
        loading="${index === 0 ? "eager" : "lazy"}"
      >

      <figcaption>

        <span>
          ${String(index + 1).padStart(2, "0")}
        </span>

        <b>
          ${escapeHtml(title)}
        </b>

        <small>
          ${getCategoryLabel(category)}
        </small>

      </figcaption>
    `;


    /* -----------------------------------------------------
       Lightbox
       ----------------------------------------------------- */

    figure.addEventListener("click", () => {
      openLightbox({
        ...project,
        src: imageSource,
        title: title,
        category: category
      });
    });


    /* -----------------------------------------------------
       Adicionar ao DOM
       ----------------------------------------------------- */

    gallery.appendChild(figure);


    /*
     * Pequeno delay para permitir que o navegador monte
     * o elemento antes da animação.
     */

    requestAnimationFrame(() => {
      figure.classList.add("visible");
    });

  });

}


/* =========================================================
   CAMINHO DA IMAGEM
   ========================================================= */

function getImageSource(project) {

  /*
   * Se o JSON já possuir o caminho completo:
   *
   * {
   *   "src": "imagens/residencial/projeto-01.jpg"
   * }
   *
   * usamos diretamente.
   */

  if (project.src) {
    return project.src;
  }


  /*
   * Se o JSON usar:
   *
   * {
   *   "imagem": "projeto-01.jpg",
   *   "categoria": "residencial"
   * }
   *
   * montamos:
   *
   * imagens/residencial/projeto-01.jpg
   */

  if (project.imagem) {

    const category =
      project.category ||
      project.categoria ||
      "residencial";

    return `imagens/${category.toLowerCase()}/${project.imagem}`;
  }


  return "";
}


/* =========================================================
   CATEGORIAS
   ========================================================= */

function getCategoryLabel(category) {

  const normalizedCategory =
    String(category)
      .toLowerCase()
      .trim();


  const labels = {

    residencial: "RESIDENCIAL",

    comercial: "COMERCIAL",

    motorhome: "MOTORHOME",

    motorhomes: "MOTORHOME"

  };


  return labels[normalizedCategory] || "PROJETO";
}


/* =========================================================
   ESCAPAR HTML
   ========================================================= */

function escapeHtml(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================================================
   LIGHTBOX
   ========================================================= */

function openLightbox(project) {

  if (!lightbox) return;


  if (lightboxImage) {

    lightboxImage.src = project.src;

    lightboxImage.alt = project.title;
  }


  if (lightboxTitle) {
    lightboxTitle.textContent = project.title;
  }


  if (lightboxCategory) {

    lightboxCategory.textContent =
      getCategoryLabel(project.category);
  }


  lightbox.classList.add("active");

  document.body.style.overflow = "hidden";
}


/* =========================================================
   FECHAR LIGHTBOX
   ========================================================= */

function closeLightbox() {

  if (!lightbox) return;

  lightbox.classList.remove("active");

  document.body.style.overflow = "";
}


/* =========================================================
   FILTROS
   ========================================================= */

if (filters) {

  filters.addEventListener("click", (event) => {

    const button =
      event.target.closest("button");

    if (!button) return;


    document
      .querySelectorAll("#projectFilters button")
      .forEach((btn) => {
        btn.classList.remove("active");
      });


    button.classList.add("active");


    currentFilter =
      button.dataset.filter || "todos";


    renderProjects();

  });

}


/* =========================================================
   LIGHTBOX - CONTROLES
   ========================================================= */

if (lightboxClose) {

  lightboxClose.addEventListener(
    "click",
    closeLightbox
  );

}


if (lightbox) {

  lightbox.addEventListener("click", (event) => {

    if (event.target === lightbox) {
      closeLightbox();
    }

  });

}


document.addEventListener("keydown", (event) => {

  if (
    event.key === "Escape" &&
    lightbox &&
    lightbox.classList.contains("active")
  ) {

    closeLightbox();

  }

});


/* =========================================================
   HEADER
   ========================================================= */

const header =
  document.getElementById("header");


window.addEventListener(
  "scroll",
  () => {

    if (!header) return;

    header.classList.toggle(
      "scrolled",
      window.scrollY > 40
    );

  },
  {
    passive: true
  }
);


/* =========================================================
   MENU MOBILE
   ========================================================= */

const menu =
  document.querySelector(".menu");

const mobile =
  document.querySelector(".mobile-nav");


if (menu && mobile) {

  menu.addEventListener("click", () => {

    mobile.classList.toggle("open");

  });

}


document
  .querySelectorAll(".mobile-nav a")
  .forEach((link) => {

    link.addEventListener("click", () => {

      if (mobile) {
        mobile.classList.remove("open");
      }

    });

  });


/* =========================================================
   ELEMENTOS REVEAL ESTÁTICOS
   ========================================================= */

document
  .querySelectorAll(".reveal")
  .forEach((element) => {

    observer.observe(element);

  });


/* =========================================================
   ANO DO FOOTER
   ========================================================= */

const year =
  document.getElementById("year");


if (year) {

  year.textContent =
    new Date().getFullYear();

}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

loadProjects();