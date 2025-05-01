import React, { useState } from 'react';
import './ServiceCard.css';


const ServiceCard = ({ service }) => {
  const [hovered, setHovered] = useState(false);
  if (!service) {
    return null; 
  }
  const imageUrl = `http://localhost:5000/uploads/${service.image}`; 

  return (
    <div
      className="service-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img src={imageUrl} alt={service.name} className="service-image" />
      <h3>{service.name}</h3>

      {hovered && (
        <div className="hover-details">
          <p>{service.description}</p>
          <p>📍 {service.location}</p>
          <p>📞 {service.contact}</p>
          <p>📂 Type: {service.serviceType}</p>
        </div>
      )}
    </div>
  );
};

export default ServiceCard;
