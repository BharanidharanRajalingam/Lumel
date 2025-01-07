import { useState } from 'react'
import './index.css'

const initialData = [
  {
    id: 1,
    label: 'Electronics',
    value: 200,
    originalValue: 200,
    children: [
      {
        id: 2,
        label: 'Phones',
        value: 100,
        originalValue: 100,
      },
      {
        id: 3,
        label: 'Laptops',
        value: 100,
        originalValue: 100,
      }
    ]
  },
  {
    id: 4,
    label: 'Furniture',
    value: 1000,
    originalValue: 1000,
    children: [
      {
        id: 5,
        label: 'Tables',
        value: 300,
        originalValue: 300,
      },
      {
        id: 6,
        label: 'Chairs',
        value: 700,
        originalValue: 700,
      }
    ]
  }
]

const TableRow = ({ data, level = 0, onUpdate }) => {
  const [inputValue, setInputValue] = useState('')

  const calculateVariance = (current, original) => {
    if (original === 0) return 0
    return ((current - original) / original * 100).toFixed(2)
  }

  const handleAllocationValue = () => {
    if (!inputValue) return
    const newValue = parseFloat(inputValue)
    if (isNaN(newValue)) return

    onUpdate(data.id, newValue, 'value')
    setInputValue('')
  }

  const handleAllocationPercentage = () => {
    if (!inputValue) return
    const percentage = parseFloat(inputValue)
    if (isNaN(percentage)) return

    const newValue = data.value * (1 + percentage / 100)
    onUpdate(data.id, newValue, 'percentage')
    setInputValue('')
  }

  return (
    <>
      <tr>
        <td style={{ paddingLeft: `${level * 20}px` }}>
          {level > 0 ? '-- ' : ''}{data.label}
        </td>
        <td>{data.value.toFixed(2)}</td>
        <td>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter value"
          />
        </td>
        <td>
          <button onClick={handleAllocationPercentage}>Allocation %</button>
        </td>
        <td>
          <button onClick={handleAllocationValue}>Allocation Val</button>
        </td>
        <td>{calculateVariance(data.value, data.originalValue)}%</td>
      </tr>
      {data.children?.map(child => (
        <TableRow
          key={child.id}
          data={child}
          level={level + 1}
          onUpdate={onUpdate}
        />
      ))}
    </>
  )
}

function App() {
  const [tableData, setTableData] = useState(initialData)

  const updateNodeAndParents = (data, id, newValue, updateType) => {
    const updateNode = (node) => {
      if (node.id === id) {
        if (node.children) {
          // If updating a parent node with direct value
          const ratio = newValue / node.value
          const updatedChildren = node.children.map(child => ({
            ...child,
            value: child.value * ratio
          }))
          return { ...node, value: newValue, children: updatedChildren }
        }
        return { ...node, value: newValue }
      }

      if (node.children) {
        const updatedChildren = node.children.map(child => updateNode(child))
        const newTotal = updatedChildren.reduce((sum, child) => sum + child.value, 0)
        return { ...node, value: newTotal, children: updatedChildren }
      }

      return node
    }

    return data.map(node => updateNode(node))
  }

  const handleUpdate = (id, newValue, updateType) => {
    setTableData(prevData => updateNodeAndParents(prevData, id, newValue, updateType))
  }

  return (
    <div className="app">
      <h1>Hierarchical Table</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Label</th>
            <th>Value</th>
            <th>Input</th>
            <th>Allocation %</th>
            <th>Allocation Val</th>
            <th>Variance %</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map(row => (
            <TableRow
              key={row.id}
              data={row}
              onUpdate={handleUpdate}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App
