import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import bgImage from '@/assets/salaon bg 2.jpg'
import OurStoryAsSeenOn from './ourstory'
import SalonBadgeFollowUs from './salonbagefollowus'
import InstagramSection from './Instagramsection'
import Footer from '../common/footer'
import ServiceMenu from './Servicemenu'



interface NavLink {
  label: string
  active: boolean
}

const navLinks: NavLink[] = [
  { label: 'Home', active: true },
  { label: 'Book Online', active: false },
  { label: 'Service Menu', active: false },
  { label: 'Our story', active: false },
]

const HomePage: React.FC = () => {
  const [scrolled, setScrolled] = useState<boolean>(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen flex flex-col m-0 p-0 font-sans">

      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/55 backdrop-blur-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-[1200px] mx-auto px-8 h-16 flex items-center justify-between">
          <span className="text-white text-[13px] font-semibold tracking-[0.25em] uppercase">
            Makeova salon
          </span>
          <ul className="flex gap-10 list-none m-0 p-0">
            {navLinks.map(({ label, active }) => (
              <li key={label}>
                <a href="#" className={`text-[13px] tracking-[0.03em] no-underline pb-1 transition-colors duration-200 ${
                  active ? 'text-white border-b-[1.5px] border-[#C49A7A]' : 'text-white/75 hover:text-white'
                }`}>{label}</a>
              </li>
            ))}
          </ul>
          {/* Single Login button → goes to unified login page */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => (window.location.href = '/login')}
              className="bg-[#C49A7A] text-white border border-[#C49A7A] text-[13px] py-[7px] px-[22px] rounded cursor-pointer tracking-[0.04em] font-medium transition-all duration-200 hover:bg-[#b3896a] hover:border-[#b3896a] flex items-center gap-2"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex-1 min-h-screen flex flex-col">
        <img src={bgImage} alt="Salon interior"
          className="absolute top-[-10px] left-[-10px] w-[calc(100%+20px)] h-[calc(100%+20px)] object-cover z-0 blur-[3px] scale-[1.04]" />
        <div className="absolute inset-0 bg-black/52 z-10" />
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center text-center pt-16 pb-[120px] px-6">
          <h1 className="font-serif text-[clamp(28px,4vw,52px)] font-bold text-white leading-[1.25] max-w-[680px] mt-0 mb-9">
            Always Make Room for a Little<br />
            <span className="text-[#C49A7A]">Beauty</span>{' '}
            <span className="text-white">in Your Life</span>
          </h1>
          <div className="flex gap-4 flex-wrap justify-center">
            <button className="bg-[#C49A7A] text-white border-none py-3 px-8 text-[13px] font-medium tracking-[0.05em] rounded-[3px] cursor-pointer transition-opacity duration-200 hover:opacity-85">
              Book Appointment
            </button>
          </div>
        </div>

        {/* Bottom info bar */}
        <div className="relative z-20 bg-black/42 w-full">
          <div className="max-w-[1200px] mx-auto py-7 px-8 grid grid-cols-3 gap-8">
            <div>
              <p className="text-white/45 text-[11px] tracking-[0.18em] uppercase mb-2.5 mt-0">Contact</p>
              <p className="text-white/80 text-[13px] mb-1 mt-0 leading-relaxed">7610866846</p>
              <p className="text-white/80 text-[13px] m-0 leading-relaxed">info@Makeovasalon.com</p>
            </div>
            <div className="text-center">
              <p className="text-white/45 text-[11px] tracking-[0.18em] uppercase mb-2.5 mt-0">Hours</p>
              <p className="text-white/80 text-[13px] mb-1 mt-0 leading-relaxed">Mon to Fri: 7:30 am — 1:00 am</p>
              <p className="text-white/80 text-[13px] mb-1 mt-0 leading-relaxed">Sat: 9:00 am — 1:00 am</p>
              <p className="text-white/80 text-[13px] m-0 leading-relaxed">Sun: 9:00 am — 11:30 pm</p>
            </div>
            <div className="text-right">
              <p className="text-white/45 text-[11px] tracking-[0.18em] uppercase mb-2.5 mt-0">Location</p>
              <p className="text-white/80 text-[13px] mb-1 mt-0 leading-relaxed">101/A, Manglam Elite,</p>
              <p className="text-white/80 text-[13px] mb-1 mt-0 leading-relaxed">Saket, Old Palasia</p>
              <p className="text-white/80 text-[13px] m-0 leading-relaxed">Indore, India</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Page Sections ── */}
      <ServiceMenu />
      <OurStoryAsSeenOn />
      <SalonBadgeFollowUs />
      <InstagramSection />
      <Footer />
      

    </div>
  )
}

export default HomePage