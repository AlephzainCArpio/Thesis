import { useState, useEffect } from "react";
import { Table, Button, Tag, message, Drawer, Descriptions, Carousel } from "antd";
import api from "../../services/api";

// Robust helper for extracting image URLs from any DB format
const getImagesArray = (images) => {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    if (images.includes(",")) return images.split(",").map((s) => s.trim());
    return [images];
  }
  return [];
};
const getImageUrl = (img) => {
  if (!img) return "";
  if (img.startsWith("/uploads/")) return img;
  if (/^https?:\/\//.test(img)) return img;
  return `/uploads/${img.replace(/^\/?uploads\//, "")}`;
};

const AdminCateringPage = () => {
  const [caterings, setCaterings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedCatering, setSelectedCatering] = useState(null);

  useEffect(() => {
    fetchCaterings();
  }, []);

  const fetchCaterings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/admin/caterings");
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
      title: "Cuisine Type",
      dataIndex: "cuisineType",
      key: "cuisineType",
    },
    {
      title: "Max People",
      dataIndex: "maxPeople",
      key: "maxPeople",
      sorter: (a, b) => a.maxPeople - b.maxPeople,
      sortOrder: sortedInfo.columnKey === "maxPeople" && sortedInfo.order,
    },
    {
      title: "Price/Person",
      dataIndex: "pricePerPerson",
      key: "pricePerPerson",
      render: (p) => `₱${p?.toLocaleString() || "0"}`,
      sorter: (a, b) => a.pricePerPerson - b.pricePerPerson,
      sortOrder: sortedInfo.columnKey === "pricePerPerson" && sortedInfo.order,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: getStatusTag,
      filters: [
        { text: "Pending", value: "PENDING" },
        { text: "Approved", value: "APPROVED" },
        { text: "Rejected", value: "REJECTED" },
      ],
      filteredValue: filteredInfo.status || null,
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button type="link" onClick={() => { setSelectedCatering(record); setDrawerVisible(true); }}>
          Details
        </Button>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
        <Button onClick={fetchCaterings}>Refresh</Button>
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

      <Drawer
        title={selectedCatering?.name || "Catering Details"}
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={500}
      >
        {selectedCatering && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Name">{selectedCatering.name}</Descriptions.Item>
            <Descriptions.Item label="Location">{selectedCatering.location}</Descriptions.Item>
            <Descriptions.Item label="Description">{selectedCatering.description}</Descriptions.Item>
            <Descriptions.Item label="Cuisine Type">{selectedCatering.cuisineType}</Descriptions.Item>
            <Descriptions.Item label="Max People">{selectedCatering.maxPeople}</Descriptions.Item>
            <Descriptions.Item label="Price/Person">₱{selectedCatering.pricePerPerson?.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Dietary Options">
              {(() => {
                let arr = [];
                if (!selectedCatering.dietaryOptions) return "None";
                if (Array.isArray(selectedCatering.dietaryOptions)) arr = selectedCatering.dietaryOptions;
                else if (typeof selectedCatering.dietaryOptions === "string") {
                  if (selectedCatering.dietaryOptions.startsWith("[") && selectedCatering.dietaryOptions.endsWith("]")) {
                    try {
                      arr = JSON.parse(selectedCatering.dietaryOptions);
                    } catch {
                      arr = selectedCatering.dietaryOptions.split(",").map(s => s.trim());
                    }
                  } else {
                    arr = selectedCatering.dietaryOptions.split(",").map(s => s.trim());
                  }
                }
                return arr.length > 0 ? arr.map((o, i) => <Tag key={i}>{o}</Tag>) : "None";
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Images">
              {(() => {
                const arr = getImagesArray(selectedCatering.images);
                return arr.length > 0 ? (
                  <Carousel autoplay>
                    {arr.map((img, i) => (
                      <img key={i} src={getImageUrl(img)} alt={`catering-${i}`} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
                    ))}
                  </Carousel>
                ) : "No images";
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Status">{getStatusTag(selectedCatering.status)}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default AdminCateringPage;