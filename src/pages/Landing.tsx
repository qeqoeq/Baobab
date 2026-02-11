function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌳</span>
            <span className="text-xl font-bold text-primary">Baobab</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#hero" className="text-gray-700 hover:text-primary transition-colors">
              Accueil
            </a>
            <a href="#how" className="text-gray-700 hover:text-primary transition-colors">
              Comment ça marche
            </a>
            <a href="#login" className="text-primary font-semibold hover:underline">
              Connexion
            </a>
          </nav>
          {/* Mobile menu button */}
          <button className="md:hidden text-gray-700 text-2xl" aria-label="Menu">
            ☰
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section
        id="hero"
        className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 md:py-32 bg-secondary"
      >
        <span className="text-5xl mb-6">💚</span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-primary leading-tight">
          Baobab – Le GPS de vos relations
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-700 max-w-2xl">
          Prenez soin de vos relations comme vous prenez soin de votre santé
        </p>
        <button className="mt-8 bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors shadow-md">
          Commencer gratuitement
        </button>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section id="how" className="py-16 md:py-24 px-4 bg-white">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-primary mb-12">
          Comment ça marche
        </h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white shadow-lg rounded-xl p-6 text-center hover:shadow-xl transition-shadow">
            <span className="text-4xl">🗺️</span>
            <h3 className="mt-4 text-xl font-semibold text-primary">
              Visualisez votre réseau
            </h3>
            <p className="mt-2 text-gray-600">
              Cartographiez vos proches et visualisez d'un coup d'œil l'état de
              chaque relation.
            </p>
          </div>
          {/* Card 2 */}
          <div className="bg-white shadow-lg rounded-xl p-6 text-center hover:shadow-xl transition-shadow">
            <span className="text-4xl">💚</span>
            <h3 className="mt-4 text-xl font-semibold text-primary">
              Évaluez vos relations
            </h3>
            <p className="mt-2 text-gray-600">
              Attribuez un score de santé à chaque relation et suivez son
              évolution dans le temps.
            </p>
          </div>
          {/* Card 3 */}
          <div className="bg-white shadow-lg rounded-xl p-6 text-center hover:shadow-xl transition-shadow">
            <span className="text-4xl">🔔</span>
            <h3 className="mt-4 text-xl font-semibold text-primary">
              Recevez des rappels
            </h3>
            <p className="mt-2 text-gray-600">
              Ne laissez plus une relation s'éteindre : recevez des rappels
              personnalisés pour garder le lien.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-100 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            © 2026 Baobab. Tous droits réservés.
          </p>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm">
            <a href="#about" className="text-gray-600 hover:text-primary transition-colors">
              À propos
            </a>
            <a href="#contact" className="text-gray-600 hover:text-primary transition-colors">
              Contact
            </a>
            <a href="#cgu" className="text-gray-600 hover:text-primary transition-colors">
              CGU
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
