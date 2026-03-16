"use client";


import { ApiAlert } from "./api-alert";
import { getApiBaseUrl } from "@/lib/api-config";

interface ApiListProps {
  entityName: string;
  entityIdName: string;
  router: string
}

export const ApiList: React.FC<ApiListProps> = ({
  entityName,
  entityIdName,
  router
}) => {
  const origin = getApiBaseUrl();
  const baseUrl = `${origin}${router}`;

  return (
    <>
      <ApiAlert
        title="GET"
        variant="public"
        description={`${baseUrl}/${entityName}`}
      />
      <ApiAlert
        title="GET"
        variant="public"
        description={`${baseUrl}/${entityName}/{${entityIdName}}`}
      />
      <ApiAlert
        title="POST"
        variant="admin"
        description={`${baseUrl}/${entityName}`}
      />
      <ApiAlert
        title="PATCH"
        variant="admin"
        description={`${baseUrl}/${entityName}/{${entityIdName}}`}
      />
      <ApiAlert
        title="DELETE"
        variant="admin"
        description={`${baseUrl}/${entityName}/{${entityIdName}}`}
      />
    </>
  );
};

// export const ApiListUser: React.FC<ApiListProps> = ({
//   entityName,
//   entityIdName,
// }) => {

//   return (
//     <>
//       <ApiAlert
//         title="GET"
//         variant="public"
//         description={`${baseUrl}/${entityName}`}
//       />
//     </>
//   );
// };