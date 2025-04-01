import { Drawer, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const MuiAside = ({ open, onClose, children, title }) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ className: 'bg-gray-100 w-[600px]' }}
    >
      {/* Close Button */}
      <div className="flex items-center justify-between p-3 border-b-default border-borderGray">
        <IconButton
          onClick={onClose}
          sx={{
            backgroundColor: '#e5e7eb',
            color: '#374151',
            '&:hover': { backgroundColor: '#d1d5db', color: '#111827' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        <div className="font-pmedium text-subtitle">{title}</div>
        <div></div>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-start h-screen gap-4">
        <div className='w-full p-4'>{children}</div>
      </div>
    </Drawer>
  );
};

export default MuiAside;
