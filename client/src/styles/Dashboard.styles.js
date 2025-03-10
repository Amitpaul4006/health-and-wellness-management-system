import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    backgroundColor: '#f0f7ff',
    backgroundImage: 'linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%)'
  },
  appBar: {
    backgroundColor: '#2196f3'
  },
  styledPaper: {
    padding: theme.spacing(3),
    margin: theme.spacing(2, 0),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    boxShadow: theme.shadows[3]
  },
  addButton: {
    marginTop: theme.spacing(2),
    backgroundColor: '#2e7d32',
    '&:hover': {
      backgroundColor: '#1b5e20'
    }
  },
  formContainer: {
    marginTop: theme.spacing(2)
  },
  gridContainer: {
    marginTop: theme.spacing(3)
  },
  toolbarTitle: {
    flexGrow: 1
  },
  headerIcon: {
    marginRight: theme.spacing(2)
  },
  medicationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#1976d2',
    marginBottom: theme.spacing(2)
  }
}));
