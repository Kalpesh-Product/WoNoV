import biznestLogo from "../../../../../assets/biznest/biznest_logo.jpg";

const HandOverNoDuesForm = () => {
  return (
    <div>
      {/* <div>Make here</div> */}
      <div>
        <div className="  h-full">
          <div className="border  bg-[#fa0606] w-[50rem] h-[70rem] mx-auto">
            <div className="  bg-white ml-10 h-full">
              <div className="  bg-white mx-10 h-full flex flex-col justify-between">
                <div>
                  <div className="pt-20 flex items-center justify-center">
                    <img
                      className="w-[90%] h-[80%] object-contain cursor-pointer"
                      src={biznestLogo}
                      alt="logo"
                    />
                    {/* <p className="text-center text-[10rem]">
                      BI<span className="text-red-600">Z</span> Nest
                    </p> */}
                  </div>
                  <div>
                    <p className="text-center underline font-bold uppercase text-[1.9rem]">
                      Mustaro Technoserve Private Limited
                    </p>
                  </div>
                  <div>
                    <p className="text-right py-5">
                      <span className="font-bold">Date:</span> DD/MM/YY
                    </p>
                  </div>
                  <div className="py-5">
                    <span className="font-bold">Employee Name:</span> <br />
                    <span className="font-bold">Employee Code:</span> <br />
                    <span className="font-bold">Designation:</span> <br />
                    <span className="font-bold">Department:</span> <br />
                    <span className="font-bold">Hire Date:</span> <br />
                    <span className="font-bold">Date of Exit:</span>
                  </div>
                  {/* <div className="py-5 font-bold">
                    <p>Subject: Experience Letter</p>
                  </div> */}
                  <div>
                    <p className="py-5 font-bold uppercase underline text-center">
                      HANDOVER & NO-DUES FORM
                    </p>
                  </div>
                  <div>
                    <p>
                      This is to certify that ______________, having Employee ID
                      __________ and having worked with Mustaro Technoserve
                      Private Limited, The company has no outstanding dues
                      payable against him in any manner as of ________________
                      <br />
                      We confirm that all financial matters, including salary
                      and other financial obligations, have been settled as per
                      the company’s policies and procedures.
                      <br />
                      The Full and Final settlement is currently under process,
                      and once completed, it will cover all financial
                      obligations, including salary, benefits, and any other
                      dues, as per the company's policies.
                      <br />
                      <br />
                      <span className="font-bold">
                        Signature of the Employee: __________________
                      </span>
                      <br />
                      <br />
                      <br />
                      <span className="font-bold">
                        Official Handover from __________:
                      </span>
                      <br />
                      <br />
                      <br />
                      <br />
                      Please find below the assets handed over to you, to
                      support you in carrying out your assignment in the most
                      proficient manner
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-4"></div>
          {/* <div className="border  bg-[#fa0606] w-[50rem] h-[70rem] mx-auto">
            <div className="  bg-white ml-10 h-full">
              <div className="  bg-white mx-10 h-full flex flex-col justify-between">
                <div>
                  <div>
                    <table>table</table>
                  </div>
                  <div>
                    <p className="text-right py-5">
                      <span className="font-bold">Date:</span> DD/MM/YY
                    </p>
                  </div>
                  <div className="py-5">
                    <span className="font-bold">To,</span> <br />
                    Name <br />
                    Designation <br />
                    Worked From
                  </div>

                  <div>
                    <p className="py-5 font-bold uppercase underline text-center">
                      HANDOVER & NO-DUES FORM
                    </p>
                  </div>
                  <div>
                    <p>
                      This is to certify that [Name] was employed with Mustaro
                      Technoserve Private Limited “BIZ Nest” for a period of
                      Eleven Months. He was hired on [DOJ], and his last working
                      date was [LWD]. His last position title was [Designation].
                      <br />
                      <br />
                      We wish him all the best for his future endeavors.
                      <br />
                      <br />
                      <br />
                      Yours Sincerely,
                      <br />
                      <br />
                      <br />
                      <br />
                      (Name)
                      <br />
                      (Designation) – Human Resources Department
                    </p>
                  </div>
                </div>
                <div>
                  <p className="py-20 text-xs font-sans text-center text-gray-500">
                    Mustaro Technoserve Pvt Ltd, Sunteck Kanaka Corporate Park,
                    501 (A) B’ Wing, 5th Floor Patto Plaza, Panaji - 403 001.
                  </p>
                </div>
              </div>
            </div>
          </div> */}

          <div className="border bg-[#fa0606] w-[50rem] h-[70rem] mx-auto">
            <div className="bg-white ml-10 h-full">
              <div className="bg-white mx-10 h-full flex flex-col justify-between">
                <div>
                  <p className="text-center py-5 font-bold uppercase underline">
                    HANDOVER & NO-DUES FORM
                  </p>
                  <table className="w-full border-collapse border border-gray-500 text-left text-sm">
                    <thead>
                      <tr className="bg-[#fabf8f]">
                        <th className="border border-gray-500 p-2">Sr. No</th>
                        <th className="border border-gray-500 p-2">
                          Particulars
                        </th>
                        <th className="border border-gray-500 p-2">
                          Handover made to
                        </th>
                        <th className="border border-gray-500 p-2">
                          Signature
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td
                          className="border border-gray-500 p-2 font-bold"
                          colSpan={1}>
                          A
                        </td>
                        <td
                          className="border border-gray-500 p-2 font-bold text-center"
                          colSpan={3}>
                          Knowledge Transfer
                        </td>
                      </tr>
                      {[
                        "List of important contacts",
                        "Useful resources",
                        "Location of records",
                        "List of outstanding tasks",
                      ].map((item, index) => (
                        <tr key={index}>
                          <td className="border border-gray-500 p-2">
                            {index + 1}
                          </td>
                          <td className="border border-gray-500 p-2">{item}</td>
                          <td className="border border-gray-500 p-2"></td>
                          <td className="border border-gray-500 p-2"></td>
                        </tr>
                      ))}
                      <tr>
                        <td
                          className="border border-gray-500 p-2 font-bold"
                          colSpan={1}>
                          B
                        </td>
                        <td
                          className="border border-gray-500 p-2 font-bold text-center"
                          colSpan={3}>
                          Recovery of Company Assets
                        </td>
                      </tr>
                      {[
                        "Laptop/Mobile Phone/Sim Cards",
                        "Cabinet Keys or Otherwise",
                        "IT & Company Equipment",
                        "Drive Containing Projects",
                      ].map((item, index) => (
                        <tr key={index}>
                          <td className="border border-gray-500 p-2">
                            {index + 1}
                          </td>
                          <td className="border border-gray-500 p-2">{item}</td>
                          <td className="border border-gray-500 p-2"></td>
                          <td className="border border-gray-500 p-2"></td>
                        </tr>
                      ))}
                      <tr>
                        <td
                          className="border border-gray-500 p-2 font-bold"
                          colSpan={1}>
                          C
                        </td>
                        <td
                          className="border border-gray-500 p-2 font-bold text-center"
                          colSpan={3}>
                          IT Permissions & Access
                        </td>
                      </tr>
                      {[
                        "Laptop Passwords",
                        "Revoke Biometric Access or Otherwise",
                        "Company Email ID & Password",
                        "Others",
                      ].map((item, index) => (
                        <tr key={index}>
                          <td className="border border-gray-500 p-2">
                            {index + 1}
                          </td>
                          <td className="border border-gray-500 p-2">{item}</td>
                          <td className="border border-gray-500 p-2"></td>
                          <td className="border border-gray-500 p-2"></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="py-5">
                    <p className="font-bold">Employee Acknowledgment:</p>
                    <p>
                      I, _____________, acknowledge that I have cleared all my
                      dues and responsibilities as mentioned above. I have
                      returned all company-owned property, settled all financial
                      obligations, and completed the necessary handovers.
                    </p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold py-3">
                          Employee Signature: __________________
                        </p>
                      </div>
                      <div>
                        <p className="font-bold py-3">
                          Date: __________________
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="py-5">
                    <p className="font-bold">Supervisor/HR Acknowledgment:</p>
                    <p>
                      I, Deputy Manager – HR & Administration, confirm that all
                      the items mentioned above have been checked and cleared
                      for the employee.
                    </p>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold py-3">
                          Supervisor/HR Signature: __________________
                        </p>
                      </div>
                      <div>
                        <p className="font-bold py-3">
                          Date: __________________
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="py-10 text-xs font-sans text-center text-gray-500">
                    Mustaro Technoserve Pvt Ltd, Sunteck Kanaka Corporate Park,
                    501 (A) B’ Wing, 5th Floor Patto Plaza, Panaji - 403 001.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HandOverNoDuesForm;
