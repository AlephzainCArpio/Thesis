import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Tag,
  Drawer,
  Descriptions,
  message,
  Carousel,
} from "antd";
import api from "../../services/api";

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

const AdminDesignersPage = () => {
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchDesigners();
  }, []);

  const fetchDesigners = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/admin/designers");
      setDesigners(response.data);
    } catch (error) {
      message.error("Failed to fetch designers.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "PENDING": return <Tag color="blue">Pending</Tag>;
      case "APPROVED": return <Tag color="green">Approved</Tag>;
      case "REJECTED": return <Tag color="red">Rejected</Tag>;
      default: return <Tag>{status}</Tag>;
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
    { title: "Location", dataIndex: "location", key: "location", ellipsis: true },
    { title: "Design Style", dataIndex: "style", key: "style", ellipsis: true },
    { title: "Price Range", dataIndex: "priceRange", key: "priceRange", ellipsis: true },
    { title: "Event Types", dataIndex: "eventTypes", key: "eventTypes", ellipsis: true },
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
        <Button type="link" onClick={() => { setSelected(record); setDrawerVisible(true); }}>
          Details
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Button onClick={fetchDesigners} style={{ marginBottom: 16 }}>
        Refresh
      </Button>
      <Table
        columns={columns}
        dataSource={designers}
        rowKey="id"
        loading={loading}
        onChange={(pagination, filters, sorter) => {
          setFilteredInfo(filters);
          setSortedInfo(sorter);
        }}
        pagination={{ pageSize: 10 }}
      />

      <Drawer
        title={selected?.name}
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={600}
      >
        {selected && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Name">{selected.name}</Descriptions.Item>
            <Descriptions.Item label="Location">{selected.location}</Descriptions.Item>
            <Descriptions.Item label="Description">{selected.description}</Descriptions.Item>
            <Descriptions.Item label="Style">{selected.style}</Descriptions.Item>
            <Descriptions.Item label="Price Range">{selected.priceRange}</Descriptions.Item>
            <Descriptions.Item label="Event Types">{selected.eventTypes}</Descriptions.Item>
            <Descriptions.Item label="Portfolio">{selected.portfolio}</Descriptions.Item>
            <Descriptions.Item label="Images">
              {(() => {
                const arr = getImagesArray(selected.images);
                return arr.length > 0 ? (
                  <Carousel autoplay>
                    {arr.map((img, i) => (
                      <img key={i} src={getImageUrl(img)} alt={`designer-${i}`} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
                    ))}
                  </Carousel>
                ) : "No images";
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Status">{getStatusTag(selected.status)}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default AdminDesignersPage;