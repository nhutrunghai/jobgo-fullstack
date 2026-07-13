export default function EmployerTopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-6 lg:py-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <label className="relative block w-full max-w-[560px]">
          <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">search</span>
          <input
            type="text"
            placeholder="Tìm kiếm hệ thống..."
            className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-12 pr-4 text-[15px] outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <div className="flex items-center justify-end gap-4 text-slate-500">
          <button type="button" className="relative rounded-full p-2 transition hover:bg-slate-100 hover:text-blue-600" aria-label="Thông báo">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          <button type="button" className="rounded-full p-2 transition hover:bg-slate-100 hover:text-blue-600" aria-label="Trợ giúp">
            <span className="material-symbols-outlined text-[20px]">help</span>
          </button>

          <div className="hidden h-8 w-px bg-slate-200 md:block" />
          <p className="truncate text-sm font-semibold text-slate-800 sm:text-base lg:text-lg">Quản lý tuyển dụng</p>
        </div>
      </div>
    </header>
  )
}
