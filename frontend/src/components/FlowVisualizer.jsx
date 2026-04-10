import React, { useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
} from 'reactflow'
import dagre from '@dagrejs/dagre'
import 'reactflow/dist/style.css'

// ── Layout constants ──────────────────────────────────────────────────────────
const NODE_WIDTH  = 188
const NODE_HEIGHT = 76

// ── Custom node component ─────────────────────────────────────────────────────
function CourseNode({ data }) {
  return (
    <div
      style={{ width: NODE_WIDTH, height: NODE_HEIGHT }}
      className="
        flex flex-col items-center justify-center px-3 py-2 text-center
        bg-slate-800 border border-slate-600 rounded-xl
        hover:border-uoft-gold transition-colors cursor-default
      "
    >
      {/* Target handle (top) — incoming edges from course that requires this one */}
      <Handle type="target" position={Position.Top} className="!bg-uoft-gold !border-0 !w-2 !h-2" />

      <span className="font-mono font-bold text-uoft-gold text-xs leading-none">
        {data.code}
      </span>
      <span className="text-gray-300 text-[10px] leading-tight mt-1.5 line-clamp-2 max-w-[160px]">
        {data.name}
      </span>

      {/* Source handle (bottom) — outgoing edges to courses that require this one */}
      <Handle type="source" position={Position.Bottom} className="!bg-uoft-gold !border-0 !w-2 !h-2" />
    </div>
  )
}

const nodeTypes = { courseNode: CourseNode }

// ── dagre auto-layout ─────────────────────────────────────────────────────────
function applyDagreLayout(nodes, edges) {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({
    rankdir: 'BT',   // Bottom-to-Top: prerequisites at bottom, searched course at top
    ranksep: 90,
    nodesep: 48,
    marginx: 24,
    marginy: 24,
  })

  nodes.forEach((n) => g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT }))
  edges.forEach((e) => g.setEdge(e.source, e.target))
  dagre.layout(g)

  return nodes.map((n) => {
    const pos = g.node(n.id)
    return {
      ...n,
      position: {
        x: pos.x - NODE_WIDTH  / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
    }
  })
}

// ── Recursive JSON → flat nodes + edges ──────────────────────────────────────
function flattenCourse(course, nodes, edges, visited = new Set()) {
  if (visited.has(course.code)) return
  visited.add(course.code)

  nodes.push({
    id: course.code,
    type: 'courseNode',
    data: { code: course.code, name: course.name },
    position: { x: 0, y: 0 },  // overwritten by dagre
  })

  if (course.prerequisites && course.prerequisites.length > 0) {
    course.prerequisites.forEach((prereq) => {
      edges.push({
        id: `${prereq.code}→${course.code}`,
        source: prereq.code,
        target: course.code,
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#FFD700',
          width: 18,
          height: 18,
        },
        style: { stroke: '#FFD700', strokeWidth: 2 },
      })
      flattenCourse(prereq, nodes, edges, visited)
    })
  }
}

// ── Main component ────────────────────────────────────────────────────────────
export default function FlowVisualizer({ courseData }) {
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes = []
    const edges = []
    flattenCourse(courseData, nodes, edges)
    const laidOutNodes = applyDagreLayout(nodes, edges)
    return { initialNodes: laidOutNodes, initialEdges: edges }
  }, [courseData])

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  return (
    <div
      className="w-full rounded-xl overflow-hidden border border-gray-700"
      style={{ height: '600px' }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        attributionPosition="bottom-right"
        style={{ background: '#030712' }}
      >
        <Background color="#1e293b" gap={24} size={1} />
        <Controls />
        <MiniMap
          nodeColor={() => '#1e293b'}
          maskColor="rgba(3, 7, 18, 0.7)"
          style={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
        />
      </ReactFlow>
    </div>
  )
}
