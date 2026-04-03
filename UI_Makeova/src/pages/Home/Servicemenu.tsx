import React from 'react'

interface Service {
  label: string
  icon: React.ReactNode
}

const HairIcon = () => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Scissors */}
    <line x1="16" y1="14" x2="32" y2="30" stroke="#2d2d2d" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="32" y1="14" x2="16" y2="30" stroke="#2d2d2d" strokeWidth="1.6" strokeLinecap="round"/>
    <circle cx="14.5" cy="12.5" r="4" stroke="#C49A7A" strokeWidth="1.5" fill="#F5C5B5" fillOpacity="0.5"/>
    <circle cx="33.5" cy="12.5" r="4" stroke="#C49A7A" strokeWidth="1.5" fill="#F5C5B5" fillOpacity="0.5"/>
    <circle cx="14.5" cy="31.5" r="4" stroke="#C49A7A" strokeWidth="1.5" fill="#F5C5B5" fillOpacity="0.5"/>
    <circle cx="33.5" cy="31.5" r="4" stroke="#C49A7A" strokeWidth="1.5" fill="#F5C5B5" fillOpacity="0.5"/>
  </svg>
)

const MakeupIcon = () => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Lipstick */}
    <rect x="21" y="28" width="14" height="18" rx="2" stroke="#2d2d2d" strokeWidth="1.5" fill="none"/>
    <rect x="21" y="18" width="14" height="12" rx="1.5" stroke="#2d2d2d" strokeWidth="1.5" fill="none"/>
    {/* Tip */}
    <path d="M23 18 L23 13 Q28 9.5 33 13 L33 18Z" stroke="#C49A7A" strokeWidth="1.4" fill="#F5C5B5" fillOpacity="0.65" strokeLinejoin="round"/>
    {/* Grip lines */}
    <line x1="21" y1="33" x2="35" y2="33" stroke="#C49A7A" strokeWidth="1" opacity="0.55"/>
    <line x1="21" y1="37" x2="35" y2="37" stroke="#C49A7A" strokeWidth="1" opacity="0.55"/>
  </svg>
)

const ManicureIcon = () => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Center petal */}
    <path d="M28 38 C28 38 20 33 20 23 C20 16 24 12 28 12 C32 12 36 16 36 23 C36 33 28 38 28 38Z"
      stroke="#2d2d2d" strokeWidth="1.5" fill="none"/>
    {/* Left petal */}
    <path d="M28 35 C28 35 16 33 14 24 C12 17 17 12 21 13"
      stroke="#C49A7A" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
    {/* Right petal */}
    <path d="M28 35 C28 35 40 33 42 24 C44 17 39 12 35 13"
      stroke="#C49A7A" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
    {/* Inner fill */}
    <ellipse cx="28" cy="23" rx="5" ry="8" fill="#F5C5B5" fillOpacity="0.45" stroke="#C49A7A" strokeWidth="1.2"/>
    {/* Stem */}
    <line x1="28" y1="38" x2="28" y2="46" stroke="#2d2d2d" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const SkincareIcon = () => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Head */}
    <path d="M28 10 C20 10 15 17 15 24 C15 33 19 40 28 42 C37 40 41 33 41 24 C41 17 36 10 28 10Z"
      stroke="#2d2d2d" strokeWidth="1.5" fill="none"/>
    {/* Hair with salmon fill */}
    <path d="M15 24 C13 19 15 10 21 9 C25 8 29 11 32 9 C36 7 41 13 41 19"
      stroke="#C49A7A" strokeWidth="1.4" strokeLinecap="round"
      fill="#F5C5B5" fillOpacity="0.4"/>
    {/* Ear */}
    <path d="M15 24 C12 23 11 26 12 28 C13 30 15 29 15 27"
      stroke="#2d2d2d" strokeWidth="1.4" fill="none"/>
  </svg>
)

const FacialIcon = () => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Face mask */}
    <path d="M28 9 C19 9 14 16 14 24 C14 33 18 41 23 43 C25 44 31 44 33 43 C38 41 42 33 42 24 C42 16 37 9 28 9Z"
      stroke="#2d2d2d" strokeWidth="1.5" fill="none"/>
    {/* Eye holes */}
    <ellipse cx="21" cy="23" rx="3.5" ry="2.8" stroke="#C49A7A" strokeWidth="1.4" fill="#F5C5B5" fillOpacity="0.5"/>
    <ellipse cx="35" cy="23" rx="3.5" ry="2.8" stroke="#C49A7A" strokeWidth="1.4" fill="#F5C5B5" fillOpacity="0.5"/>
    {/* Nose */}
    <path d="M25.5 30 Q28 32.5 30.5 30" stroke="#2d2d2d" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
    {/* Mouth */}
    <path d="M22 36 Q28 40 34 36" stroke="#2d2d2d" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
    {/* Ear loops */}
    <path d="M14 23 C11 22 10 25 11 27 C12 29 14 28 14 26" stroke="#C49A7A" strokeWidth="1.3" fill="none"/>
    <path d="M42 23 C45 22 46 25 45 27 C44 29 42 28 42 26" stroke="#C49A7A" strokeWidth="1.3" fill="none"/>
  </svg>
)

const services: Service[] = [
  { label: 'Hair', icon: <HairIcon /> },
  { label: 'Makeup', icon: <MakeupIcon /> },
  { label: 'manicure pedicure', icon: <ManicureIcon /> },
  { label: 'Skincare', icon: <SkincareIcon /> },
  { label: 'Facial', icon: <FacialIcon /> },
]

const ServiceMenu: React.FC = () => {
  return (
    <section className="bg-white py-16 px-6">
      {/* Title */}
      <h2
        className="text-center text-[30px] font-bold text-gray-800 mb-14"
        style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
      >
        Service Menu
      </h2>

      {/* Icons row */}
      <div className="max-w-[900px] mx-auto flex justify-between items-start mb-14 px-8">
        {services.map(({ label, icon }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-4 cursor-pointer group w-[150px]"
          >
            <div className="transition-transform duration-200 group-hover:scale-110">
              {icon}
            </div>
            <span
              className="text-[13px] text-gray-700 tracking-wide text-center leading-snug group-hover:text-[#C49A7A] transition-colors duration-200"
              style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Description */}
      <p
        className="text-center text-[14px] text-gray-400 max-w-[420px] mx-auto leading-relaxed mb-10"
      >
        Get your nails done for great mood. Simple pleasures can make your week, not just day.
      </p>

      {/* CTA Button — salmon/peach fill matching figma */}
      <div className="flex justify-center">
        <button
          className="text-gray-800 text-[14px] tracking-[0.04em] py-3 px-12 cursor-pointer transition-opacity duration-200 hover:opacity-80 border-none font-medium rounded-[3px]"
          style={{
            background: '#F5C5B5',
            fontFamily: "'Georgia', 'Times New Roman', serif",
          }}
        >
          View Service Menu
        </button>
      </div>
    </section>
  )
}

export default ServiceMenu