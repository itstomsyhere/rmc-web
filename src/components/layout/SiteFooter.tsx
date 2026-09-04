import { Link } from 'react-router-dom'
import { useConfig } from '@/store/config'

export function SiteFooter() {
  const cfg = useConfig(s => s.config)
  return (
    <footer className="mt-auto border-t border-line-2 bg-white">
      <div className="container flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <img src={cfg.assets.logo} alt="" className="h-9 w-9 rounded-[10px]" />
          <div>
            <p className="text-[14px] font-extrabold tracking-tight text-teal-700">Resique Supermarket Laundry</p>
            <p className="text-[12px] text-ink-3">Apique Group · {cfg.campaign.label}</p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-semibold text-ink-2" aria-label="Tautan kaki">
          <a href="https://wa.me/6281200000000" target="_blank" rel="noreferrer" className="hover:text-teal-700">Hubungi sales</a>
          <Link to="/login" className="hover:text-teal-700">Masuk</Link>
          <Link to="/register" className="hover:text-teal-700">Daftar RMC</Link>
          <Link to="/admin" className="text-ink-4 hover:text-teal-700">Admin</Link>
        </nav>
      </div>
    </footer>
  )
}
