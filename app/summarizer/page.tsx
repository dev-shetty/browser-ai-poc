"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useModelAvailability } from "@/hooks/useModelAvailability"
import { useState } from "react"

type SummarizerType = "key-points" | "tldr" | "teaser" | "headline"
type SummarizerFormat = "markdown" | "plain-text"
type SummarizerLength = "short" | "medium" | "long"

type SummarizerOptions = {
  type: SummarizerType
  format: SummarizerFormat
  length: SummarizerLength
}

export default function SummarizerPage() {
  const [text, setText] = useState<string>("")
  const [response, setResponse] = useState<string | null>(null)
  const [type, setType] = useState<SummarizerType>("key-points")
  const [format, setFormat] = useState<SummarizerFormat>("markdown")
  const [length, setLength] = useState<SummarizerLength>("medium")

  const { error, status, modelDownloadProgress, downloadModel, createModel } =
    useModelAvailability<SummarizerOptions>({
      isSupported: () => "Summarizer" in self,
      checkAvailability: async () => {
        return await Summarizer.availability()
      },
      createModel: async (options) => {
        const opts = options || { type, format, length }
        return await Summarizer.create({
          type: opts.type,
          format: opts.format,
          length: opts.length,
        })
      },
      downloadModel: async (options, onProgress) => {
        const opts = options || { type, format, length }
        await Summarizer.create({
          type: opts.type,
          format: opts.format,
          length: opts.length,
          monitor(m) {
            m.addEventListener("downloadprogress", (e) => {
              onProgress?.(e.loaded * 100)
              console.log(`Downloaded ${e.loaded * 100}%`)
            })
          },
        })
      },
      notSupportedError: "Summarizer API is not supported",
      unavailableError: "Summarizer API is not available",
    })

  const summarize = async (text: string) => {
    const summarizer = await createModel({ type, format, length })
    const result = await summarizer.summarize(text)
    setResponse(result)
  }

  const summarizeStream = async (text: string) => {
    const summarizer = await createModel({ type, format, length })
    const result = summarizer.summarizeStreaming(text)
    let response = ""
    for await (const chunk of result) {
      response += chunk
      setResponse(response)
    }
  }

  return (
    <div className="p-12 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Summarizer AI</h1>
      <p>Status: {status}</p>
      {status === "downloadable" && (
        <div className="my-4">
          <Button
            onClick={() => downloadModel({ type, format, length })}
            className="cursor-pointer"
          >
            Download Model
          </Button>
          <p>Download progress: {modelDownloadProgress}%</p>
        </div>
      )}
      <p className="text-red-500 py-2">{error}</p>
      {status === "available" && (
        <div className="my-4 grid gap-4">
          <div className="flex gap-2">
            <Select
              value={type}
              onValueChange={(value) => setType(value as SummarizerType)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="key-points">Key Points</SelectItem>
                <SelectItem value="tldr">TLDR</SelectItem>
                <SelectItem value="teaser">Teaser</SelectItem>
                <SelectItem value="headline">Headline</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={format}
              onValueChange={(value) => setFormat(value as SummarizerFormat)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="markdown">Markdown</SelectItem>
                <SelectItem value="plain-text">Plain Text</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={length}
              onValueChange={(value) => setLength(value as SummarizerLength)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select length" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="long">Long</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 max-w-4xl">
            <Textarea
              placeholder="Enter text to summarize"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[200px]"
            />
          </div>
          <div className="flex gap-2">
            <Button
              className="cursor-pointer flex-1"
              onClick={() => {
                summarizeStream(text)
              }}
              disabled={!text}
            >
              Summarize
            </Button>
          </div>
          {response && (
            <div className="flex gap-2 max-w-4xl">
              <div className="w-full p-4 border rounded-lg bg-zinc-50 dark:bg-zinc-900">
                <div className="whitespace-pre-wrap">{response}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
