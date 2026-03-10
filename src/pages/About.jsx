import React from 'react'

function About() {
  const features = [
    {
      title: 'Secure Authentication',
      description:
        'Bookify uses Firebase authentication with email/password and Google sign-in to keep accounts safe and onboarding simple.',
    },
    {
      title: 'Book Listing Workflow',
      description:
        'Add books with title, ISBN, price, and cover image. Images are uploaded through Cloudinary and metadata is saved to Firestore.',
    },
    {
      title: 'Live Library View',
      description:
        'All listed books are displayed as responsive cards on the home page so users can browse the catalog quickly.',
    },
    {
      title: 'Detail Exploration',
      description:
        'Each book has a dedicated details page where users can view complete information in a focused layout.',
    },
  ]

  return (
    <div className="min-h-screen bg-white px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-8 shadow-sm md:p-12">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">About Bookify</p>
          <h1 className="mb-4 text-3xl font-extrabold text-slate-900 md:text-4xl">A smart home for your reading world</h1>
          <p className="max-w-3xl text-slate-600">
            Bookify is a modern book management platform built to help readers and collectors organize titles, store details,
            and discover books in a clean digital experience.
          </p>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-xl font-bold text-slate-900">Mission</h2>
            <p className="text-slate-600">
              To make personal book management effortless by combining simple workflows, reliable cloud storage, and a
              beautiful interface that encourages reading culture.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-xl font-bold text-slate-900">Vision</h2>
            <p className="text-slate-600">
              To become a trusted digital library companion where every reader can build, track, and share a meaningful
              collection from anywhere.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-bold text-slate-900">Core Features</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-2 text-lg font-semibold text-emerald-700">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-3 text-2xl font-bold text-slate-900">About The Author</h2>
          <p className="text-slate-600">
            Bookify is developed by <span className="font-semibold text-slate-800">Angad Kumar</span>, a passionate builder focused on
            creating clean and useful web experiences. This project reflects his interest in practical full-stack
            development using React, Firebase, and cloud media services.
          </p>
          <p className="mt-3 text-slate-600">
            The goal behind Bookify is not just to store data, but to deliver a polished and user-friendly product that
            solves a real everyday problem for readers.
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Contact: <a className="font-medium text-emerald-700 hover:text-emerald-800" href="mailto:angadkumaar82@gmail.com">angadkumaar82@gmail.com</a>
          </p>
        </section>
      </div>
    </div>
  )
}

export default About
