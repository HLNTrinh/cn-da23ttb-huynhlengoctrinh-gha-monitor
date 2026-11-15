// CSS cắt chữ dài bằng "..." (viết trực tiếp trong file)
export const ellipsisStyles = {
  // Khung cha: cho phép co lại trong flex để dấu "..." hoạt động
  box: {
    minWidth: 0,
    flex: 1,
    maxWidth: '100%'
  },
  // Cắt 1 dòng
  oneLine: {
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  // Cắt tối đa 2 dòng
  twoLines: {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    wordBreak: 'break-word'
  }
};

// CSS cho hàng danh sách: bên trái co lại được, nút bên phải giữ nguyên kích thước
export const rowStyles = {
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    minWidth: 0
  },
  // Cụm nội dung bên trái (avatar + chữ)
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: 0,
    flex: 1
  },
  // Cụm nút / trạng thái bên phải
  actions: {
    flexShrink: 0
  },
  // Ô người dùng GitHub trong bảng
  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    maxWidth: '260px',
    minWidth: 0
  }
};

export const repoStyles = {
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    padding: '16px 24px',
    textAlign: 'left',
    minWidth: 0
  },
  // Cụm bên trái: icon + thông tin, luôn sát trái
  left: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '14px',
    flex: 1,
    minWidth: 0,
    margin: 0,
    padding: 0
  },
  icon: {
    width: '40px',
    height: '40px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px',
    background: '#eef4ff',
    fontSize: '18px'
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: 0,
    flex: 1,
    textAlign: 'left'
  },
  name: {
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '15px'
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '6px',
    fontSize: '13px'
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0
  }
};