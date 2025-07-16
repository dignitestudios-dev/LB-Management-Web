import { useUsers } from "../../hooks/api/Get";

const DummyHome = () => {
  const { data, loading, pagination } = useUsers("/admin/users", 1);
  
  return <div>DummyHome</div>;
};

export default DummyHome;
