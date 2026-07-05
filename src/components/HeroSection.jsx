export default function HeroSection({ product }) {
  return (
    <section className="hero-section">
      <div className="hero-copy">
        <p className="eyebrow">New season edit</p>
        <h1>Style for Every Woman</h1>
        <p className="hero-description">
          Curated fits for every mood and moment, from everyday tops to festive ethnic wear, all in one wardrobe.
        </p>
        <div className="hero-actions">
          <button className="primary-button">Shop the edit</button>
        </div>
      </div>
    </section>
  );
}
