import React, { useMemo } from 'react'
import ReactFlow, {
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'

const NODE_WIDTH   = 188
const NODE_HEIGHT  = 76
const PADDING      = 56
const SLOT_WIDTH   = NODE_WIDTH + 60   // 248px — horizontal space per leaf slot
const LEVEL_HEIGHT = NODE_HEIGHT + 90  // 166px — vertical gap between levels

const invisibleHandle = { opacity: 0, width: 6, height: 6 }

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
        boxShadow: '0 2px 10px rgba(0, 42, 92, 0.4)',
      }}
    >
      <Handle type="target" position={Position.Top}    style={invisibleHandle} />
      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#ffffff', fontSize: '12px', lineHeight: 1 }}>
        {data.code}
      </span>
      <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '10px', lineHeight: 1.3, marginTop: '6px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', maxWidth: '160px' }}>
        {data.name}
      </span>
      {data.isSource && <Handle type="source" position={Position.Bottom} style={invisibleHandle} />}
    </div>
  )
}

const nodeTypes = { courseNode: CourseNode }

// ── Symmetric layout ─────────────────────────────────────────────────────────
//
// Each subtree is assigned a number of equal-width "slots". Siblings are
// padded to the widest sibling's slot count, so every parent is centred over
// its children and the whole tree is horizontally symmetric.

function buildLayoutTree(course, visited = new Set()) {
  if (visited.has(course.code)) return null
  visited.add(course.code)
  const children = (course.prerequisites || [])
    .map(p => buildLayoutTree(p, visited))
    .filter(Boolean)
  return { code: course.code, children }
}

function getSlotWidth(node) {
  if (!node.children.length) return 1
  const maxChildSlots = Math.max(...node.children.map(getSlotWidth))
  return node.children.length * maxChildSlots
}

function assignSlotPositions(node, slotStart, slotWidth, depth, out) {
  out[node.code] = { x: slotStart + slotWidth / 2, y: depth }
  if (!node.children.length) return
  const maxChildSlots = Math.max(...node.children.map(getSlotWidth))
  const totalChildSlots = node.children.length * maxChildSlots
  const childrenStart = slotStart + (slotWidth - totalChildSlots) / 2
  node.children.forEach((child, i) => {
    assignSlotPositions(child, childrenStart + i * maxChildSlots, maxChildSlots, depth + 1, out)
  })
}

function applySymmetricLayout(courseData, nodes) {
  const tree = buildLayoutTree(courseData)
  const slotPositions = {}
  assignSlotPositions(tree, 0, getSlotWidth(tree), 0, slotPositions)

  return nodes.map(n => {
    const p = slotPositions[n.id]
    if (!p) return { ...n, position: { x: 0, y: 0 } }
    return {
      ...n,
      position: {
        x: p.x * SLOT_WIDTH - NODE_WIDTH / 2,
        y: p.y * LEVEL_HEIGHT,
      },
    }
  })
}

// ─────────────────────────────────────────────────────────────────────────────

function flattenCourse(course, nodes, edges, visited = new Set()) {
  if (visited.has(course.code)) return
  visited.add(course.code)
  nodes.push({
    id: course.code,
    type: 'courseNode',
    data: { code: course.code, name: course.name, isSource: false },
    position: { x: 0, y: 0 },
  })
  if (course.prerequisites && course.prerequisites.length > 0) {
    course.prerequisites.forEach(prereq => {
      edges.push({
        id: `${course.code}→${prereq.code}`,
        source: course.code,
        target: prereq.code,
        type: 'step',
        markerEnd: { type: MarkerType.ArrowClosed, color: '#4a90d9', width: 16, height: 16 },
        style: { stroke: '#4a90d9', strokeWidth: 2 },
      })
      flattenCourse(prereq, nodes, edges, visited)
    })
  }
}

export default function FlowVisualizer({ courseData }) {
  const { initialNodes, initialEdges, containerHeight } = useMemo(() => {
    const nodes = []
    const edges = []
    flattenCourse(courseData, nodes, edges)

    const sourceCodes = new Set(edges.map(e => e.source))
    nodes.forEach(n => { n.data.isSource = sourceCodes.has(n.id) })

    const laidOutNodes = applySymmetricLayout(courseData, nodes)

    if (laidOutNodes.length === 0) {
      return { initialNodes: [], initialEdges: [], containerHeight: window.innerHeight }
    }

    // Centre the root node over the window centre; fall back to PADDING on left
    const rootNode = laidOutNodes.find(n => n.id === courseData.code)
    const rootCenterX = rootNode.position.x + NODE_WIDTH / 2
    const allX = laidOutNodes.map(n => n.position.x)
    const allY = laidOutNodes.map(n => n.position.y)
    let offsetX = window.innerWidth / 2 - rootCenterX
    const leftmostX = Math.min(...allX)
    if (leftmostX + offsetX < PADDING) offsetX = PADDING - leftmostX
    const offsetY = PADDING

    const centeredNodes = laidOutNodes.map(n => ({
      ...n,
      position: { x: n.position.x + offsetX, y: n.position.y + offsetY },
    }))

    const maxY = Math.max(...allY)

    return {
      initialNodes: centeredNodes,
      initialEdges: edges,
      containerHeight: Math.max(window.innerHeight, maxY + NODE_HEIGHT + PADDING * 2),
    }
  }, [courseData])

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  return (
    <div style={{ width: '100%', height: containerHeight }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        panOnDrag={false}
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        fitView={false}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        style={{ background: 'transparent' }}
        proOptions={{ hideAttribution: true }}
      />
    </div>
  )
}
