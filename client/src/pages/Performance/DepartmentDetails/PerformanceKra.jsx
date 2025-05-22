import { useParams } from "react-router-dom"
import AgTable from "../../../components/AgTable"
import WidgetSection from "../../../components/WidgetSection"
import DateWiseTable from "../../../components/Tables/DateWiseTable";

const PerformanceKra = () => {
    const {department} = useParams();
    console.log(department)
  return (
    <div className="flex flex-col gap-4">
      <WidgetSection padding layout={1}>
        <DateWiseTable data={[]} columns={[]} />
        <AgTable data={[]} columns={[]} tableTitle={`${department || ''} DEPARTMENT DAILY KRA`} buttonTitle={"Add Daily KRA"} hideFilter/>
      </WidgetSection>
    </div>
  )
}

export default PerformanceKra
