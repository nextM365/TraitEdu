export default function AboutView() {
  return (
    <div className="about-page module-card">
      <div className="about-hero">
        <div className="about-hero-content">
          <p className="about-badge">About Us</p>
          <h1>Welcome to Trait School</h1>
          <p className="about-summary">
            Trait School is a student-centric learning community dedicated to nurturing curiosity, confidence, and
            academic excellence for each learner.
          </p>
        </div>
      </div>
      <div className="about-body">
        <section>
          <h2>Who we are</h2>
          <p>
            Trait School combines modern classroom experiences with supportive mentorship to build strong foundations
            in knowledge, values, and future readiness.
          </p>
        </section>

        <section>
          <h2>What we do</h2>
          <p>
            We empower students through personalized programs, collaborative learning, and real-world skill development
            so they can achieve their goals with confidence.
          </p>
        </section>

        <div className="about-logo-card">
          <div className="about-logo-placeholder">T</div>
          <div>
            <p className="about-logo-title">TRAIT SCHOOL</p>
            <p className="about-logo-tagline">Curiosity · Growth · Success</p>
          </div>
        </div>
      </div>
    </div>
  );
}
