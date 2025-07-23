import React from "react";
import DetalisFormatted from "../../../components/DetalisFormatted";
import { useLocation } from "react-router-dom";
import humanDate from "../../../utils/humanDateForamt";
import { inrFormat } from "../../../utils/currencyFormat";

const ViewClientInfo = () => {
  const location = useLocation();
  const { selectedLead } = location.state;
  console.log("selected Lead : ", selectedLead);
  return (
    <div className="grid grid-col-2 gap-4 p-4">
      {selectedLead ? (
        <>
          <DetalisFormatted
            title="Company Name"
            detail={selectedLead.companyName}
            upperCase
          />
          <DetalisFormatted title="POC Name" detail={selectedLead.pocName} />
          <DetalisFormatted
            title="Designation"
            detail={selectedLead.designation || "—"}
          />
          <DetalisFormatted
            title="Contact Number"
            detail={selectedLead.contactNumber}
          />
          <DetalisFormatted title="Email" detail={selectedLead.emailAddress} />
          <DetalisFormatted
            title="Lead Status"
            detail={selectedLead.leadStatus}
          />
          <DetalisFormatted title="Sector" detail={selectedLead.sector} />
          <DetalisFormatted title="Service" detail={selectedLead.serviceName} />
          <DetalisFormatted
            title="Client Budget"
            detail={`INR ${inrFormat(selectedLead.clientBudget)}`}
          />
          <DetalisFormatted
            title="Date of Contact"
            detail={humanDate(selectedLead.dateOfContact)}
          />
          <DetalisFormatted
            title="Last Follow-up Date"
            detail={humanDate(selectedLead.lastFollowUpDate)}
          />
          <DetalisFormatted
            title="Remarks"
            detail={selectedLead.remarksComments || "—"}
          />
        </>
      ) : (
        <div>No lead selected.</div>
      )}
    </div>
  );
};

export default ViewClientInfo;
