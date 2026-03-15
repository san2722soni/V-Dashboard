export const dynamic = "force-dynamic";

import { GlobalConfigClient } from "./components/client";

const GlobalConfigPage = async () => {
  let configs: any[] = [];

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/entity/global-config`,
      { cache: "no-store" }
    );

    const data = await res.json();

    const list = Array.isArray(data) ? data : data.configs;

    configs = list.map((item: any) => ({
      id: item._id || "",
      key: item.key,
      value: item.value,
      valueType: item.valueType,
    }));
  } catch (error) {
    console.error("Failed to fetch global config:", error);
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <GlobalConfigClient data={configs} />
      </div>
    </div>
  );
};

export default GlobalConfigPage;
