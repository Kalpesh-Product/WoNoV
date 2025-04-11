import React from 'react'

const MonthMeetings = () => {
    
  return (
    <div>
        <AgTable
          key={filteredMeetings.length}
          search
          tableTitle={"Manage Meetings"}
          data={filteredMeetings || []}
          columns={columns}
        />
    </div>
  )
}

export default MonthMeetings
