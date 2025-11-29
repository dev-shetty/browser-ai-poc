import Image from "next/image"

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-16 px-6 bg-white dark:bg-black sm:items-center">
        <h1 className="text-[2.5rem] leading-tight font-serif font-normal text-zinc-900 dark:text-zinc-100 mb-2 text-center">
          Wait, my browser can do this?
        </h1>
        <h2 className="text-base text-zinc-600 dark:text-zinc-300 font-light mb-14 text-center">
          A talk at Hackersmang, official pre-summit event for IndiaAI
        </h2>

        <div className="flex items-center gap-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 shadow px-4 py-3 mb-10 w-full max-w-xs">
          <div>
            <Image
              src="/levels-square.png"
              alt="Levels.fyi logo"
              width={36}
              height={36}
              className=""
            />
          </div>
          <div className="flex flex-col">
            <span className="text-md font-medium text-zinc-900 dark:text-zinc-50">
              Deveesh Shetty
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Software Engineer, Levels.fyi
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}
