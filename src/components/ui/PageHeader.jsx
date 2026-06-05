export function PageHeader({ eyebrow, title, children, action }) {
    return (
      <header className="mb-6 border-b border-slate-200 pb-4">
        {eyebrow ? (
          <p className="m-0 text-xs font-black uppercase tracking-[0.09em] text-[#005eb8]">
            {eyebrow}
          </p>
        ) : null}
  
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="m-0 text-3xl font-black tracking-[-0.03em] text-[#003087] md:text-4xl">
              {title}
            </h1>
  
            {children ? (
              <p className="mt-2 max-w-4xl text-sm font-semibold leading-6 text-slate-500 md:text-base">
                {children}
              </p>
            ) : null}
          </div>
  
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </header>
    );
  }