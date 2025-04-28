'use client'

import React, { useEffect, useState, useCallback } from 'react'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd'

type DesignItem = { id: number; name: string }
type Assignment = Record<string, DesignItem | null>
interface Shop      { name: string; url: string }

const EMAIL_COLUMNS = {
  pool:   'All Customers',
  now:    'Send Now',
  weekly: 'Scheduled Weekly',
} as const

const ALL_DRAGGABLE_ID = 'ALL_CUSTOMERS'

export default function CampaignManagerPage() {
  // ── State ────────────────────────────────────────────────────────────────
  const [shops,        setShops]        = useState<Shop[]>([])
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)

  const [allEmailsRaw, setAllEmailsRaw] = useState<string[]>([])
  const [sendNow,      setSendNow]      = useState<string[]>([])
  const [weekly,       setWeekly]       = useState<string[]>([])

  const [designs,      setDesigns]      = useState<DesignItem[]>([])
  const [assignments,  setAssignments]  = useState<Assignment>({})

  // ── Load shops from cookie ───────────────────────────────────────────────
  useEffect(() => {
    const raw = document.cookie
      .split('; ')
      .find((c) => c.startsWith('my_webshops='))
      ?.split('=')[1] ?? '[]'
    try {
      const list = JSON.parse(decodeURIComponent(raw)) as Shop[]
      setShops(list)
      if (list.length) setSelectedShop(list[0])
    } catch {
      setShops([])
    }
  }, [])

  // ── Slugify helper ───────────────────────────────────────────────────────
  const slugify = useCallback((url: string) =>
    url
      .replace(/^https?:\/\/(www\.)?/, '')
      .replace(/\/$/, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .toLowerCase(),
    []
  )

  // ── Fetch campaign & emails on shop change ──────────────────────────────
  useEffect(() => {
    if (!selectedShop) return
    const slug = slugify(selectedShop.url)

    // load saved campaign state
    fetch(`/api/campaigns/${slug}`)
      .then((r) => r.json())
      .then((camp: {
        send_now: string[]
        weekly: string[]
        assignments: Assignment
      }) => {
        setSendNow(camp.send_now)
        setWeekly(camp.weekly)
        setAssignments(camp.assignments)
      })
      .finally(() => {
        // re-fetch raw emails
        fetch(`/api/webshops/${slug}/customers`)
          .then((r) => r.json())
          .then((data: { emails: string[] }) => {
            setAllEmailsRaw(data.emails ?? [])
          })
          .catch(console.error)
      })
  }, [selectedShop, slugify])

  // ── Fetch saved designs once ─────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/designs')
      .then((r) => r.json())
      .then((data: DesignItem[]) => setDesigns(data))
      .catch(console.error)
  }, [])

  // ── Derived counts ───────────────────────────────────────────────────────
  const poolCount = allEmailsRaw.length
  const nowCount  = sendNow.length
  const weeklyCount = weekly.length

  // ── Email drag & drop ───────────────────────────────────────────────────
  const onEmailDragEnd = (res: DropResult) => {
    const { source, destination, draggableId } = res
    if (!destination) return
    if (
      source.droppableId === destination.droppableId &&
      source.index       === destination.index
    ) return

    // Bulk‐move ALL pool → now or pool → weekly
    if (
      source.droppableId === 'pool' &&
      draggableId === ALL_DRAGGABLE_ID
    ) {
      if (destination.droppableId === 'now') {
        setSendNow((prev) => [...prev, ...allEmailsRaw])
      } else if (destination.droppableId === 'weekly') {
        setWeekly((prev) => [...prev, ...allEmailsRaw])
      }
      return
    }

    // Bulk‐move ALL now → weekly
    if (
      source.droppableId === 'now' &&
      draggableId === ALL_DRAGGABLE_ID
    ) {
      setWeekly((prev) => [...prev, ...sendNow])
      setSendNow([])
      return
    }

    // Bulk‐move ALL weekly → now
    if (
      source.droppableId === 'weekly' &&
      draggableId === ALL_DRAGGABLE_ID
    ) {
      setSendNow((prev) => [...prev, ...weekly])
      setWeekly([])
      return
    }
  }

  // ── Design assignment drag & drop ───────────────────────────────────────
  const onAssignDragEnd = (res: DropResult) => {
    const { source, destination } = res
    if (
      source.droppableId === 'designs' &&
      destination?.droppableId === 'now'
    ) {
      const design = designs[source.index]
      const email  = sendNow[destination.index]
      setAssignments((prev) => ({ ...prev, [email]: design }))
    }
  }

  // ── Save campaign ───────────────────────────────────────────────────────
  const saveCampaign = () => {
    if (!selectedShop) return
    const slug = slugify(selectedShop.url)
    fetch(`/api/campaigns/${slug}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shop:        slug,
        send_now:    sendNow,
        weekly:      weekly,
        assignments: assignments,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Save failed')
        alert('Campaign saved!')
      })
      .catch((err) => {
        console.error(err)
        alert('Error saving campaign')
      })
  }

  return (
    <main className="p-6 space-y-6">
      {/* Shop selector */}
      <div>
        <label className="block mb-1 font-medium">Select Shop</label>
        <select
          className="border px-3 py-2 rounded"
          value={selectedShop?.url ?? ''}
          onChange={(e) =>
            setSelectedShop(
              shops.find((s) => s.url === e.target.value) ?? null
            )
          }
        >
          {shops.map((s) => (
            <option key={s.url} value={s.url}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Emails Drag & Drop */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Assign Emails</h2>
        <DragDropContext onDragEnd={onEmailDragEnd}>
          <div className="flex gap-4">
            {(['pool','now','weekly'] as const).map((colId) => {
              const count = colId === 'pool'
                ? poolCount
                : colId === 'now'
                  ? nowCount
                  : weeklyCount

              return (
                <Droppable key={colId} droppableId={colId}>
                  {(prov) => (
                    <div
                      ref={prov.innerRef}
                      {...prov.droppableProps}
                      className="flex-1 border rounded p-4 max-h-64 overflow-auto"
                    >
                      <h3 className="font-medium mb-2">
                        {EMAIL_COLUMNS[colId]} ({count})
                      </h3>

                      <Draggable
                        draggableId={ALL_DRAGGABLE_ID}
                        index={0}
                      >
                        {(dprov) => (
                          <div
                            ref={dprov.innerRef}
                            {...dprov.draggableProps}
                            {...dprov.dragHandleProps}
                            className="p-3 mb-2 bg-gray-100 rounded cursor-move text-center"
                          >
                            {EMAIL_COLUMNS[colId]} ({count})
                          </div>
                        )}
                      </Draggable>

                      {prov.placeholder}
                    </div>
                  )}
                </Droppable>
              )
            })}
          </div>
        </DragDropContext>
      </div>

      {/* Designs Palette */}
      <div>
        <h2 className="text-lg font-semibold mb-2">
          Preparation: Assign Designs
        </h2>
        <DragDropContext onDragEnd={onAssignDragEnd}>
          <Droppable droppableId="designs" direction="horizontal">
            {(prov) => (
              <div
                ref={prov.innerRef}
                {...prov.droppableProps}
                className="flex gap-2 overflow-auto p-2 border rounded bg-gray-50"
              >
                {designs.map((d, i) => (
                  <Draggable
                    key={d.id}
                    draggableId={`design-${d.id}`}
                    index={i}
                  >
                    {(dprov) => (
                      <div
                        ref={dprov.innerRef}
                        {...dprov.draggableProps}
                        {...dprov.dragHandleProps}
                        className="px-3 py-1 bg-blue-100 rounded cursor-grab"
                      >
                        {d.name}
                      </div>
                    )}
                  </Draggable>
                ))}
                {prov.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Save Button */}
      <button
        onClick={saveCampaign}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
      >
        Save Campaign
      </button>
    </main>
  )
}
