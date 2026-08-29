import React from 'react'

export function PageHero({ badge, title, description, bannerIcon, bannerTitle, bannerText }) {
  return (
    <section className="page-hero">
      <section className="page-header">
        <span className="pill">{badge}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </section>
      <div className="feature-banner">
        <span className="banner-icon">{bannerIcon}</span>
        <div>
          <strong>{bannerTitle}</strong>
          <p>{bannerText}</p>
        </div>
        <div className="wave one" />
        <div className="wave two" />
      </div>
    </section>
  )
}
