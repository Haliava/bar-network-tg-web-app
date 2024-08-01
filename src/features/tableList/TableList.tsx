import { List } from '@mui/material'
import React, { useState } from 'react'

import { ITable } from '../../api/TablesService'
import Table from '../table'

import styles from './styles.module.scss'

const TableList = ({
  onTableSelect,
  tables,
  selectedFloor,
}: {
  onTableSelect: (table: ITable) => void
  tables: ITable[]
  selectedFloor: number
}) => {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)

  const handleTableClick = (table: ITable) => {
    setSelectedTableId((prevSelectedTableId) =>
      prevSelectedTableId === table.table_uuid ? null : table.table_uuid,
    )
    onTableSelect(table)
  }

  return (
    <div className={styles.root}>
      <List style={{ maxHeight: '100%', overflow: 'auto' }}>
        {tables
          .filter((table) => selectedFloor === table.storey)
          .map((table) => (
            <Table
              key={table?.table_uuid}
              info={table}
              isSelected={table.table_uuid === selectedTableId}
              onClick={() => handleTableClick(table)}
            />
          ))}
      </List>
    </div>
  )
}

export default TableList
