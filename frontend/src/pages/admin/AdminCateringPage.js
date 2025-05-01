import { useState, useEffect } from "react";
import { Table, Button, Tag, message } from "antd";
import api from "../../services/api";

const AdminCateringPage = () => {
  const [caterings, setCaterings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

  useEffect(() => {
    fetchCaterings();
  }, []);

  const fetchCaterings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/caterings");
      setCaterings(response.data);
    } catch (error) {
      message.error("Failed to fetch catering services");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "PENDING":
        return <Tag color="blue">Pending</Tag>;
      case "APPROVED":
        return <Tag color="green">Approved</Tag>;
      case "REJECTED":
        return <Tag color="red">Rejected</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === "name" && sortedInfo.order,
      ellipsis: true,
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      ellipsis: true,
    },
    {
      title: "Max People",
      dataIndex: "maxPeople",
      key: "maxPeople",
      sorter: (a, b) => a.maxPeople - b.maxPeople,
      sortOrder: sortedInfo.columnKey === "maxPeople" && sortedInfo.order,
    },
    {
      title: "Price Per Person",
      dataIndex: "pricePerPerson",
      key: "pricePerPerson",
      render: (price) => `₱${price?.toLocaleString() || "0"}`,
      sorter: (a, b) => a.pricePerPerson - b.pricePerPerson,
      sortOrder: sortedInfo.columnKey === "pricePerPerson" && sortedInfo.order,
    },
    {
      title: "Cuisine Type",
      dataIndex: "cuisineType",
      key: "cuisineType",
      ellipsis: true,
    },
    {
      title: "Dietary Options",
      dataIndex: "dietaryOptions",
      key: "dietaryOptions",
      ellipsis: true,
    },
    {
      title: "Service Type",
      dataIndex: "serviceType",
      key: "serviceType",
      ellipsis: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
      filters: [
        { text: "Pending", value: "PENDING" },
        { text: "Approved", value: "APPROVED" },
        { text: "Rejected", value: "REJECTED" },
      ],
      filteredValue: filteredInfo.status || null,
      onFilter: (value, record) => record.status === value,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
        <Button onClick={() => fetchCaterings()}>Refresh</Button>
      </div>

      <Table
        columns={columns}
        dataSource={caterings}
        rowKey="id"
        loading={loading}
        onChange={(pagination, filters, sorter) => {
          setFilteredInfo(filters);
          setSortedInfo(sorter);
        }}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default AdminCateringPage;
