'use client'

import React, { useEffect, useState, useCallback } from 'react'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd'

type DesignItem  = { id: number; name: string }
type Assignment  = Record<string, DesignItem | null>
interface Shop    { name: string; url: string }

const EMAIL_COLUMNS = {
  pool:   'All Customers',
  now:    'Send Now',
  weekly: 'Scheduled Weekly',
} as const

export default function CampaignManagerPage() {
  // — State —
  const [shops,        setShops]        = useState<Shop[]>([])
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)

  const [pool,    setPool]    = useState<string[]>([])
  const [now,     setNow]     = useState<string[]>([])
  const [weekly,  setWeekly]  = useState<string[]>([])
  const [designs, setDesigns] = useState<DesignItem[]>([])
  const [assignments, setAssignments] = useState<Assignment>({})

  // — Load shops from cookie —
  useEffect(() => {
    const raw = document.cookie
      .split('; ')
      .find((c) => c.startsWith('my_webshops='))
      ?.split('=')[1] ?? '[]'
    const list = JSON.parse(decodeURIComponent(raw)) as Shop[]
    setShops(list)
    if (list.length) setSelectedShop(list[0])
  }, [])

  // — Slugify helper for API calls —
  const slugify = useCallback((url: string) =>
    url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
       .replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase(),
  [])

  // — Fetch emails & existing campaign on shop change —
  useEffect(() => {
    if (!selectedShop) return
    const slug = slugify(selectedShop.url)

    // 1) fetch campaign
    fetch(`/api/campaigns/${slug}`)
      .then((r) => r.json())
      .then((camp: {
        send_now: string[]
        weekly: string[]
        assignments: Assignment
      }) => {
        setPool([])     // we’ll refill below
        setNow(camp.send_now)
        setWeekly(camp.weekly)
        setAssignments(camp.assignments)
        // 2) fetch all emails, then pool = all - now - weekly
        return fetch(`/api/webshops/${slug}/customers`)
      })
      .then((r) => r.json())
      .then((data: { emails: string[] }) => {
        const used = new Set([ ...now, ...weekly ])
        setPool(data.emails.filter((e) => !used.has(e)))
      })
      .catch(console.error)
  }, [selectedShop, slugify])

  // — Fetch designs once —
  useEffect(() => {
    fetch('/api/designs')
      .then((r) => r.json())
      .then(setDesigns)
      .catch(console.error)
  }, [])

  // — Helpers for email DnD —
  const getList = (id: keyof typeof EMAIL_COLUMNS) =>
    ({ pool, now, weekly })[id]
  const setLists = (u: { pool: string[]; now: string[]; weekly: string[] }) => {
    setPool(u.pool); setNow(u.now); setWeekly(u.weekly)
  }

  const onEmailDragEnd = (res: DropResult) => {
    const { source, destination } = res
    if (!destination) return
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return

    const src = Array.from(getList(source.droppableId as any))
    const dst = Array.from(getList(destination.droppableId as any))
    const [m] = src.splice(source.index, 1)
    dst.splice(destination.index, 0, m)

    setLists({
      pool:   source.droppableId==='pool'   ? src : destination.droppableId==='pool'   ? dst : pool,
      now:    source.droppableId==='now'    ? src : destination.droppableId==='now'    ? dst : now,
      weekly: source.droppableId==='weekly' ? src : destination.droppableId==='weekly' ? dst : weekly,
    })
  }

  // — Assign designs by dragging onto “Send Now” —
  const onAssignDragEnd = (res: DropResult) => {
    const { source, destination } = res
    if (
      source.droppableId === 'designs' &&
      destination?.droppableId === 'now'
    ) {
      const design = designs[source.index]
      const email  = now[destination.index]
      setAssignments((a) => ({ ...a, [email]: design }))
    }
  }

  // — Bulk move buttons —
  const moveAll = (from: 'pool', to: 'now' | 'weekly') => {
    const arrFrom = [...pool]
    const arrTo   = to==='now' ? [...now, ...arrFrom] : [...weekly, ...arrFrom]
    setLists({
      pool:   [],
      now:    to==='now'    ? arrTo : now,
      weekly: to==='weekly' ? arrTo : weekly,
    })
  }

  // — Save campaign to DB —
  const saveCampaign = () => {
    if (!selectedShop) return
    const slug = slugify(selectedShop.url)
    fetch(`/api/campaigns/${slug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shop:        slug,
        send_now:    now,
        weekly:      weekly,
        assignments: assignments,
      }),
    }).then((r) => {
      if (!r.ok) console.error('Save failed')
      else alert('Campaign saved!')
    })
  }

  return (
    <main className="p-6 space-y-6">
      {/* Shop selector */}
      <div>
        <label className="block mb-1">Select Shop</label>
        <select
          className="border px-3 py-2 rounded"
          value={selectedShop?.url ?? ''}
          onChange={(e) =>
            setSelectedShop(shops.find((s) => s.url===e.target.value) ?? null)
          }
        >
          {shops.map((s) => <option key={s.url} value={s.url}>{s.name}</option>)}
        </select>
      </div>

      {/* Bulk‐move buttons */}
      <div className="flex gap-2">
        <button onClick={() => moveAll('pool','now')}  className="btn">Move All → Send Now</button>
        <button onClick={() => moveAll('pool','weekly')} className="btn">Move All → Weekly</button>
      </div>

      {/* Emails Drag & Drop */}
      <DragDropContext onDragEnd={onEmailDragEnd}>
        <div className="flex gap-4">
          {(['pool','now','weekly'] as const).map((colId) => (
            <Droppable key={colId} droppableId={colId}>
              {(prov) => (
                <div
                  ref={prov.innerRef}
                  {...prov.droppableProps}
                  className="flex-1 border rounded p-4 max-h-64 overflow-auto"
                >
                  <h3 className="font-medium mb-2">
                    {EMAIL_COLUMNS[colId]}
                  </h3>
                  {getList(colId).map((e, i) => (
                    <Draggable key={e} draggableId={e} index={i}>
                      {(dprov) => (
                        <div
                          ref={dprov.innerRef}
                          {...dprov.draggableProps}
                          {...dprov.dragHandleProps}
                          className="p-2 mb-2 bg-white rounded shadow-sm flex justify-between"
                        >
                          {e}
                          {colId==='now' && assignments[e] && (
                            <em className="text-xs text-gray-500">
                              {assignments[e]!.name}
                            </em>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {prov.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Designs Palette */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Preparation: Assign Designs</h2>
        <DragDropContext onDragEnd={onAssignDragEnd}>
          <Droppable droppableId="designs" direction="horizontal">
            {(prov) => (
              <div
                ref={prov.innerRef}
                {...prov.droppableProps}
                className="flex gap-2 overflow-auto p-2 border rounded bg-gray-50"
              >
                {designs.map((d,i) => (
                  <Draggable key={d.id} draggableId={`design-${d.id}`} index={i}>
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
