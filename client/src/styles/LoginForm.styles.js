import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(1)
  },
  input: {
    marginBottom: theme.spacing(2)
  },
  submitButton: {
    margin: theme.spacing(3, 0, 2),
    padding: theme.spacing(1),
    width: '60%',
    fontSize: '0.9rem',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark
    }
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center'
  },
  errorAlert: {
    marginBottom: theme.spacing(2),
    width: '100%'
  }
}));
