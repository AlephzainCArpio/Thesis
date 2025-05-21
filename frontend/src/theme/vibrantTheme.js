// Vibrant Ant Design custom theme token overrides
const vibrantTheme = {
  token: {
    colorPrimary: '#FF4D4F',        // Vibrant red
    colorSuccess: '#52C41A',        // Green
    colorWarning: '#FAAD14',        // Strong yellow
    colorError: '#FF4D4F',          // Red
    colorInfo: '#40A9FF',           // Bright blue
    colorBgBase: '#F6F9FF',         // Soft light background
    colorTextBase: '#22223B',       // Deep navy
    borderRadius: 10,               // Smoother corners
    fontFamily: "'Montserrat', 'Roboto', sans-serif",
    boxShadow: '0 2px 12px 0 rgba(255,77,79,0.08)', // Soft vibrant shadow
  },
  components: {
    Button: {
      borderRadius: 8,
      fontWeight: 600,
      boxShadow: '0 2px 8px 0 rgba(255,77,79,0.09)',
    },
    Card: {
      borderRadius: 14,
      boxShadow: '0 4px 18px 0 rgba(64,169,255,0.11)',
    },
    Input: {
      borderRadius: 8,
      colorBgContainer: '#fff',
      borderColor: '#40A9FF',
      hoverBorderColor: '#FF4D4F',
    },
    Table: {
      borderRadius: 10,
      colorBgContainer: '#fff',
      headerBg: '#FFFAF0',
    },
  }
};

export default vibrantTheme;