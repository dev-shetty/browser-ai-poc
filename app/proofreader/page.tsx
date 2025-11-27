"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useModelAvailability } from "@/hooks/useModelAvailability"
import { useState } from "react"

export default function ProofreaderPage() {
  const [text, setText] = useState<string>("")
  const [response, setResponse] = useState<string | null>(null)

  const { error, status, modelDownloadProgress, downloadModel, createModel } =
    useModelAvailability({
      isSupported: () => "LanguageModel" in self,
      checkAvailability: async () => {
        return await Proofreader.availability()
      },
      createModel: async () => {
        return await Proofreader.create({
          expectedInputLanguages: ["en"],
        })
      },
      downloadModel: async (options, onProgress) => {
        await Proofreader.create({
          monitor(m) {
            m.addEventListener("downloadprogress", (e) => {
              onProgress?.(e.loaded * 100)
              console.log(`Downloaded ${e.loaded * 100}%`)
            })
          },
        })
      },
      notSupportedError: "Prompt AI is not supported",
      unavailableError: "Prompt AI is not available",
    })

  const proofread = async (text: string) => {
    const proofreader = await createModel()
    const result = await proofreader.proofread(text)
    console.log(result)
    setResponse(result.correctedInput)
  }

  return (
    <div className="p-12 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Proofreader AI</h1>
      <p>Status: {status}</p>
      {status === "downloadable" && (
        <div className="my-4">
          <Button onClick={() => downloadModel()} className="cursor-pointer">
            Download Model
          </Button>
          <p>Download progress: {modelDownloadProgress}%</p>
        </div>
      )}
      <p className="text-red-500 py-2">{error}</p>
      {status === "available" && (
        <div className="my-4 grid gap-4">
          <div className="flex gap-2 max-w-4xl">
            <Textarea
              placeholder="Enter text to prompt"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              className="cursor-pointer flex-1"
              onClick={() => {
                proofread(text)
              }}
              disabled={!text}
            >
              Proofread
            </Button>
          </div>
          {response && (
            <div className="flex gap-2 max-w-4xl">
              <pre className="max-w-4xl whitespace-pre-wrap">{response}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
