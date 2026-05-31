async function loadNav() {
  const response = await fetch("/nav/nav.html");
  const html = await response.text();

  document.getElementById("nav-placeholder").innerHTML = html;

  highlightCurrentPage();
}

function highlightCurrentPage() {
  const currentPath = window.location.pathname;

  document.querySelectorAll(".nav-bar a").forEach((link) => {
    const href = link.getAttribute("href");

    const isHomePage = currentPath === "/";
    const linkIsHome = href === "/";

    if (
      (linkIsHome && isHomePage) ||
      (!linkIsHome && currentPath.startsWith(href))
    ) {
      link.classList.add("active");
    }
  });
}

loadNav();
