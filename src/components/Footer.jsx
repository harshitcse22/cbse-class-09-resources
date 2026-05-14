import { ExternalLink } from 'lucide-react'

const base = import.meta.env.BASE_URL

export default function Footer() {
  return (
    <footer className="mt-auto">
      <div className="bg-gradient-to-r from-[#006BFF] to-[#4B35F5] px-5 py-5 sm:px-12 sm:py-8 flex items-center gap-3 sm:gap-5">
        <img src={`${base}Frame.svg`} alt="Edzy" className="w-14 h-14 sm:w-16 sm:h-16 shrink-0" />
        <div>
          <div className="text-white font-bold text-sm sm:text-base">Edzy For classes 6-12</div>
          <div className="text-white/100 text-[8px] sm:text-sm mt-0.5 sm:mt-1 leading-relaxed max-w-sm">
            Edzy is a personal AI tutor for CBSE and State Board
            students, with curriculum-aligned guidance, practice,
            revision, and study plans that adapt to each learner.
          </div>
          <a
            href="https://www.edzy.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex bg-white text-[#1D4ED8] font-semibold text-[8px] px-1 py-1 rounded-sm no-underline items-center gap-1 whitespace-nowrap hover:bg-gray-50"
          >
            Explore Edzy <ExternalLink size={10} />
          </a>
        </div>
      </div>
      <div className="bg-gradient-to-r from-[#006BFF] to-[#4B35F5] px-5 pb-4 sm:px-12 text-center text-[9px] text-white/80">
          Made with ❤️  for CBSE students
      </div>
    </footer>
  )
}
