import React, { useMemo } from 'react'
import ReactFlow, {
  Controls,
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
      style={{
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        background: '#002A5C',
        border: '2px solid #4a90d9',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 12px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0, 42, 92, 0.35)',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#4a90d9', border: 'none', width: 8, height: 8 }} />

      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#ffffff', fontSize: '12px', lineHeight: 1 }}>
        {data.code}
      </span>
      <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '10px', lineHeight: 1.3, marginTop: '6px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', maxWidth: '160px' }}>
        {data.name}
      </span>

      <Handle type="source" position={Position.Bottom} style={{ background: '#4a90d9', border: 'none', width: 8, height: 8 }} />
    </div>
  )
}

const nodeTypes = { courseNode: CourseNode }

// ── dagre auto-layout ─────────────────────────────────────────────────────────
function applyDagreLayout(nodes, edges) {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({
    rankdir: 'BT',
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
    position: { x: 0, y: 0 },
  })

  if (course.prerequisites && course.prerequisites.length > 0) {
    course.prerequisites.forEach((prereq) => {
      edges.push({
        id: `${prereq.code}→${course.code}`,
        source: prereq.code,
        target: course.code,
        type: 'step',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#4a90d9',
          width: 16,
          height: 16,
        },
        style: { stroke: '#4a90d9', strokeWidth: 2 },
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
      className="w-full rounded-lg overflow-hidden"
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
        style={{ background: 'transparent' }}
      >
        <Controls />
      </ReactFlow>
    </div>
  )
}
