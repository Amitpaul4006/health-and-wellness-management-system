import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
  progressButton: {
    position: 'relative',
    padding: theme.spacing(1.5, 3),
    minWidth: 200,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark
    },
    '&.Mui-disabled': {
      backgroundColor: theme.palette.action.disabledBackground,
      color: theme.palette.action.disabled
    }
  },
  buttonText: {
    visibility: props => props.loading ? 'hidden' : 'visible',
    display: 'inline-block',
    transition: theme.transitions.create(['visibility'], {
      duration: theme.transitions.duration.short
    })
  },
  progressIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
    color: theme.palette.common.white
  },
  snackbar: {
    '& .MuiAlert-standardSuccess': {
      backgroundColor: theme.palette.success.light
    },
    '& .MuiAlert-standardError': {
      backgroundColor: theme.palette.error.light
    }
  },
  alert: {
    width: '100%',
    '& .MuiAlert-message': {
      flex: 1
    }
  }
}));
