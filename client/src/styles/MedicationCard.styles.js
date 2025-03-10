import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
  card: {
    marginBottom: theme.spacing(2),
    boxShadow: theme.shadows[3],
    '&:hover': {
      boxShadow: theme.shadows[6],
      transform: 'scale(1.01)',
      transition: 'all 0.2s'
    }
  },
  cardContent: {
    padding: theme.spacing(2)
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2)
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1)
  },
  description: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(3)
  },
  chipContainer: {
    display: 'flex',
    gap: theme.spacing(1),
    flexWrap: 'wrap'
  },
  statusChip: {
    fontWeight: 'bold'
  },
  menuButton: {
    padding: theme.spacing(0.5)
  },
  medicationIcon: {
    color: '#1976d2',
    marginRight: theme.spacing(1)
  },
  actionMenu: {
    '& .MuiMenuItem-root': {
      minHeight: 40
    }
  },
  loadingMenuItem: {
    opacity: 0.7,
    pointerEvents: 'none'
  },
  errorMessage: {
    marginTop: theme.spacing(1),
    color: theme.palette.error.main
  }
}));
