import SearchTable from "@/components/dataTable";
import React from "react";
import { getCourses } from "@/lib/getRmd";


const Search = async () => {
  const data = await getCourses();

  return (
    <div className="w-full md:px-16 px-6 py-2">
      <SearchTable data={data} title="All Courses" pageSize={10} />
    </div>
  );
};

export default Search;
