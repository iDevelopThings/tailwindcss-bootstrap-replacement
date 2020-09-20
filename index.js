const defaultTheme  = require('tailwindcss/resolveConfig')(require('tailwindcss/defaultConfig')).theme;
const plugin        = require('tailwindcss/plugin');
const tap           = require('lodash/tap');
const map           = require('lodash/map');
const toPairs       = require('lodash/toPairs');
const fromPairs     = require('lodash/fromPairs');
const mergeWith     = require('lodash/mergeWith');
const flatMap       = require('lodash/flatMap');
const isEmpty       = require('lodash/isEmpty');
const isArray       = require('lodash/isArray');
const isFunction    = require('lodash/isFunction');
const isUndefined   = require('lodash/isUndefined');
const isPlainObject = require('lodash/isPlainObject');
const svgToDataUri  = require('mini-svg-data-uri');
const traverse      = require('traverse');
const hexToRGBA     = (hex, opacity) => {
	return 'rgba(' + (hex = hex.replace('#', '')).match(new RegExp('(.{' + hex.length / 3 + '})', 'g')).map(function (l) {
		return parseInt(hex.length % 2 ? l + l : l, 16);
	}).concat(opacity || 1).join(',') + ')';
};

const fontSize = {
	'd-1' : '6rem',
	'd-2' : '5.5rem',
	'd-3' : '4.5rem',
	'd-4' : '3.5rem',
};

const defaultOptions = {
	...{displaySizes : fontSize},
	input       : {
		display          : 'block',
		appearance       : 'none',
		backgroundColor  : defaultTheme.colors.white,
		borderColor      : defaultTheme.borderColor.default,
		borderWidth      : defaultTheme.borderWidth.default,
		borderRadius     : defaultTheme.borderRadius.default,
		paddingTop       : defaultTheme.spacing[2],
		paddingRight     : defaultTheme.spacing[3],
		paddingBottom    : defaultTheme.spacing[2],
		paddingLeft      : defaultTheme.spacing[3],
		fontSize         : defaultTheme.fontSize.base,
		lineHeight       : defaultTheme.lineHeight.normal,
		'&::placeholder' : {
			color   : defaultTheme.colors.gray[500],
			opacity : '1',
		},
		'&:focus'        : {
			outline     : 'none',
			boxShadow   : defaultTheme.boxShadow.outline,
			borderColor : defaultTheme.colors.blue[400],
		},
	},
	textarea    : {
		display          : 'block',
		appearance       : 'none',
		backgroundColor  : defaultTheme.colors.white,
		borderColor      : defaultTheme.borderColor.default,
		borderWidth      : defaultTheme.borderWidth.default,
		borderRadius     : defaultTheme.borderRadius.default,
		paddingTop       : defaultTheme.spacing[2],
		paddingRight     : defaultTheme.spacing[3],
		paddingBottom    : defaultTheme.spacing[2],
		paddingLeft      : defaultTheme.spacing[3],
		fontSize         : defaultTheme.fontSize.base,
		lineHeight       : defaultTheme.lineHeight.normal,
		'&::placeholder' : {
			color   : defaultTheme.colors.gray[500],
			opacity : '1',
		},
		'&:focus'        : {
			outline     : 'none',
			boxShadow   : defaultTheme.boxShadow.outline,
			borderColor : defaultTheme.colors.blue[400],
		},
	},
	multiselect : {
		display         : 'block',
		appearance      : 'none',
		backgroundColor : defaultTheme.colors.white,
		borderColor     : defaultTheme.borderColor.default,
		borderWidth     : defaultTheme.borderWidth.default,
		borderRadius    : defaultTheme.borderRadius.default,
		paddingTop      : defaultTheme.spacing[2],
		paddingRight    : defaultTheme.spacing[3],
		paddingBottom   : defaultTheme.spacing[2],
		paddingLeft     : defaultTheme.spacing[3],
		fontSize        : defaultTheme.fontSize.base,
		lineHeight      : defaultTheme.lineHeight.normal,
		'&:focus'       : {
			outline     : 'none',
			boxShadow   : defaultTheme.boxShadow.outline,
			borderColor : defaultTheme.colors.blue[400],
		},
	},
	select      : {
		display            : 'block',
		appearance         : 'none',
		colorAdjust        : 'exact',
		'&::-ms-expand'    : {
			border             : 'none', // The select padding is causing some whitespace around the chevron which looks weird with a border
			'@media not print' : {
				display : 'none',
			},
		},
		backgroundRepeat   : 'no-repeat',
		backgroundColor    : defaultTheme.colors.white,
		borderColor        : defaultTheme.borderColor.default,
		borderWidth        : defaultTheme.borderWidth.default,
		borderRadius       : defaultTheme.borderRadius.default,
		paddingTop         : defaultTheme.spacing[2],
		paddingRight       : defaultTheme.spacing[10],
		paddingBottom      : defaultTheme.spacing[2],
		paddingLeft        : defaultTheme.spacing[3],
		fontSize           : defaultTheme.fontSize.base,
		lineHeight         : defaultTheme.lineHeight.normal,
		backgroundPosition : `right ${defaultTheme.spacing[2]} center`,
		backgroundSize     : `1.5em 1.5em`,
		iconColor          : defaultTheme.colors.gray[500],
		icon               : iconColor => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${iconColor}"><path d="M15.3 9.3a1 1 0 0 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.4l3.3 3.29 3.3-3.3z"/></svg>`,
		'&:focus'          : {
			outline     : 'none',
			boxShadow   : defaultTheme.boxShadow.outline,
			borderColor : defaultTheme.colors.blue[400],
		},
	},
	checkbox    : {
		appearance       : 'none',
		colorAdjust      : 'exact',
		'&::-ms-check'   : {
			'@media not print' : {
				color        : 'transparent', // Hide the check
				background   : 'inherit',
				borderColor  : 'inherit',
				borderRadius : 'inherit',
			}
		},
		display          : 'inline-block',
		verticalAlign    : 'middle',
		backgroundOrigin : 'border-box',
		userSelect       : 'none',
		flexShrink       : 0,
		height           : '1em',
		width            : '1em',
		color            : defaultTheme.colors.blue[500],
		backgroundColor  : defaultTheme.colors.white,
		borderColor      : defaultTheme.borderColor.default,
		borderWidth      : defaultTheme.borderWidth.default,
		borderRadius     : defaultTheme.borderRadius.default,
		iconColor        : defaultTheme.colors.white,
		icon             : iconColor => `<svg viewBox="0 0 16 16" fill="${iconColor}" xmlns="http://www.w3.org/2000/svg"><path d="M5.707 7.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4a1 1 0 0 0-1.414-1.414L7 8.586 5.707 7.293z"/></svg>`,
		'&:focus'        : {
			outline     : 'none',
			boxShadow   : defaultTheme.boxShadow.outline,
			borderColor : defaultTheme.colors.blue[400],
		},
		'&:checked'      : {
			borderColor        : 'transparent',
			backgroundColor    : 'currentColor',
			backgroundSize     : '100% 100%',
			backgroundPosition : 'center',
			backgroundRepeat   : 'no-repeat',
		},
	},
	radio       : {
		appearance       : 'none',
		colorAdjust      : 'exact',
		'&::-ms-check'   : {
			'@media not print' : {
				color        : 'transparent', // Hide the check
				background   : 'inherit',
				borderColor  : 'inherit',
				borderRadius : 'inherit',
			}
		},
		display          : 'inline-block',
		verticalAlign    : 'middle',
		backgroundOrigin : 'border-box',
		userSelect       : 'none',
		flexShrink       : 0,
		borderRadius     : '100%',
		height           : '1em',
		width            : '1em',
		color            : defaultTheme.colors.blue[500],
		backgroundColor  : defaultTheme.colors.white,
		borderColor      : defaultTheme.borderColor.default,
		borderWidth      : defaultTheme.borderWidth.default,
		iconColor        : defaultTheme.colors.white,
		icon             : iconColor => `<svg viewBox="0 0 16 16" fill="${iconColor}" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="3"/></svg>`,
		'&:focus'        : {
			outline     : 'none',
			boxShadow   : defaultTheme.boxShadow.outline,
			borderColor : defaultTheme.colors.blue[400],
		},
		'&:checked'      : {
			borderColor        : 'transparent',
			backgroundColor    : 'currentColor',
			backgroundSize     : '100% 100%',
			backgroundPosition : 'center',
			backgroundRepeat   : 'no-repeat',
		},
	},
	formGroup   : {
		group  : {
			display      : 'block',
			marginBottom : defaultTheme.spacing[4],
		},
		inline : {
			display       : 'flex',
			flexDirection : 'row',
			alignItems    : 'center',
			marginBottom  : defaultTheme.spacing[4],
			'> label'     : {
				marginBottom : 0,
				marginRight  : defaultTheme.spacing[4],
			}
		},
		label  : {
			color        : defaultTheme.colors.gray[700],
			fontWeight   : defaultTheme.fontWeight.medium,
			fontSize     : defaultTheme.fontSize.base,
			display      : 'inline-block',
			marginBottom : defaultTheme.spacing[2]
		}
	},
	button      : {
		display         : 'inline-block',
		fontWeight      : defaultTheme.fontWeight.medium,
		color           : defaultTheme.colors.gray[700],
		textAlign       : 'center',
		verticalAlign   : 'middle',
		userSelect      : 'none',
		backgroundColor : defaultTheme.colors.white,
		borderWidth     : defaultTheme.borderWidth.default,
		borderStyle     : 'solid',
		borderColor     : defaultTheme.borderColor.default,
		padding         : `.6rem 1rem`,
		fontSize        : defaultTheme.spacing[4],
		lineHeight      : defaultTheme.lineHeight.tight,
		borderRadius    : defaultTheme.borderRadius['md'],
		transition      : `color 150ms ${defaultTheme.transitionTimingFunction['in-out']},background-color 150ms ${defaultTheme.transitionTimingFunction['in-out']},border-color 150ms ${defaultTheme.transitionTimingFunction['in-out']},box-shadow 150ms ${defaultTheme.transitionTimingFunction['in-out']}`,
		
		'&:focus'  : {
			outline     : 0,
			borderColor : defaultTheme.colors.blue[300],
			boxShadow   : ` 0 0 0 3px ${hexToRGBA(defaultTheme.colors.blue[300], 0.45)}`,
		},
		'&:hover'  : {
			color : defaultTheme.colors.gray[600],
		},
		'&:active' : {
			backgroundColor : hexToRGBA(defaultTheme.colors.gray[100]),
		},
		
		'&.btn-sm' : {
			fontSize   : defaultTheme.fontSize.xs,
			lineHeight : defaultTheme.lineHeight.none,
			padding    : `.25rem 1rem`,
		},
		'&.btn-lg' : {
			fontSize   : defaultTheme.fontSize['2xl'],
			lineHeight : defaultTheme.lineHeight.loose,
			padding    : `.25rem 1rem`,
		},
		
		'&.btn-primary'         : {
			backgroundColor : defaultTheme.colors.blue[600],
			borderColor     : defaultTheme.colors.blue[600],
			color           : defaultTheme.colors.white,
			
			'&:focus'  : {
				outline     : 0,
				borderColor : defaultTheme.colors.blue[300],
				boxShadow   : ` 0 0 0 3px ${hexToRGBA(defaultTheme.colors.blue[300], 0.45)}`,
			},
			'&:hover'  : {
				backgroundColor : defaultTheme.colors.blue[500],
				borderColor     : defaultTheme.colors.blue[500],
			},
			'&:active' : {
				backgroundColor : hexToRGBA(defaultTheme.colors.blue[400]),
			},
		},
		'&.btn-outline-primary' : {
			backgroundColor : 'transparent',
			borderColor     : defaultTheme.colors.blue[600],
			color           : defaultTheme.colors.blue[600],
			
			'&:focus'  : {
				outline         : 0,
				backgroundColor : defaultTheme.colors.blue[600],
				borderColor     : defaultTheme.colors.blue[300],
				boxShadow       : ` 0 0 0 3px ${hexToRGBA(defaultTheme.colors.blue[300], 0.45)}`,
			},
			'&:hover'  : {
				backgroundColor : defaultTheme.colors.blue[600],
				color           : defaultTheme.colors.white,
			},
			'&:active' : {
				backgroundColor : defaultTheme.colors.blue[600],
			},
		},
		
		'&.btn-secondary'         : {
			backgroundColor : defaultTheme.colors.gray[600],
			borderColor     : defaultTheme.colors.gray[600],
			color           : defaultTheme.colors.white,
			
			'&:focus'  : {
				outline     : 0,
				borderColor : defaultTheme.colors.gray[300],
				boxShadow   : ` 0 0 0 3px ${hexToRGBA(defaultTheme.colors.gray[300], 0.45)}`,
			},
			'&:hover'  : {
				backgroundColor : defaultTheme.colors.gray[700],
				borderColor     : defaultTheme.colors.gray[700],
			},
			'&:active' : {
				backgroundColor : hexToRGBA(defaultTheme.colors.gray[500]),
			},
		},
		'&.btn-outline-secondary' : {
			backgroundColor : 'transparent',
			borderColor     : defaultTheme.colors.gray[600],
			color           : defaultTheme.colors.gray[600],
			
			'&:focus'  : {
				outline         : 0,
				backgroundColor : defaultTheme.colors.gray[600],
				borderColor     : defaultTheme.colors.gray[300],
				boxShadow       : ` 0 0 0 3px ${hexToRGBA(defaultTheme.colors.gray[300], 0.45)}`,
			},
			'&:hover'  : {
				backgroundColor : defaultTheme.colors.gray[600],
				color           : defaultTheme.colors.white,
			},
			'&:active' : {
				backgroundColor : defaultTheme.colors.gray[600],
			},
		},
		
		'&.btn-success'         : {
			backgroundColor : defaultTheme.colors.green[600],
			borderColor     : defaultTheme.colors.green[600],
			color           : defaultTheme.colors.white,
			
			'&:focus'  : {
				outline     : 0,
				borderColor : defaultTheme.colors.green[300],
				boxShadow   : ` 0 0 0 3px ${hexToRGBA(defaultTheme.colors.green[300], 0.45)}`,
			},
			'&:hover'  : {
				backgroundColor : defaultTheme.colors.green[500],
				borderColor     : defaultTheme.colors.green[500],
			},
			'&:active' : {
				backgroundColor : hexToRGBA(defaultTheme.colors.green[400]),
			},
		},
		'&.btn-outline-success' : {
			backgroundColor : 'transparent',
			borderColor     : defaultTheme.colors.green[600],
			color           : defaultTheme.colors.green[600],
			
			'&:focus'  : {
				outline         : 0,
				backgroundColor : defaultTheme.colors.green[600],
				borderColor     : defaultTheme.colors.green[300],
				boxShadow       : ` 0 0 0 3px ${hexToRGBA(defaultTheme.colors.green[300], 0.45)}`,
			},
			'&:hover'  : {
				color           : defaultTheme.colors.white,
				backgroundColor : defaultTheme.colors.green[600],
			},
			'&:active' : {
				backgroundColor : defaultTheme.colors.green[600],
			},
		},
		
		'&.btn-danger'         : {
			backgroundColor : defaultTheme.colors.red[600],
			borderColor     : defaultTheme.colors.red[600],
			color           : defaultTheme.colors.white,
			
			'&:focus'  : {
				outline     : 0,
				borderColor : defaultTheme.colors.red[300],
				boxShadow   : ` 0 0 0 3px ${hexToRGBA(defaultTheme.colors.red[300], 0.45)}`,
			},
			'&:hover'  : {
				backgroundColor : defaultTheme.colors.red[500],
				borderColor     : defaultTheme.colors.red[500],
			},
			'&:active' : {
				backgroundColor : hexToRGBA(defaultTheme.colors.red[400]),
			},
		},
		'&.btn-outline-danger' : {
			backgroundColor : 'transparent',
			borderColor     : defaultTheme.colors.red[600],
			color           : defaultTheme.colors.red[600],
			
			'&:focus'  : {
				outline         : 0,
				backgroundColor : defaultTheme.colors.red[600],
				borderColor     : defaultTheme.colors.red[300],
				boxShadow       : ` 0 0 0 3px ${hexToRGBA(defaultTheme.colors.red[300], 0.45)}`,
			},
			'&:hover'  : {
				color           : defaultTheme.colors.white,
				backgroundColor : defaultTheme.colors.red[600],
			},
			'&:active' : {
				backgroundColor : defaultTheme.colors.red[600],
			},
		},
		
		'&.btn-warning'         : {
			backgroundColor : defaultTheme.colors.yellow[600],
			borderColor     : defaultTheme.colors.yellow[600],
			color           : defaultTheme.colors.gray[900],
			
			'&:focus'  : {
				outline     : 0,
				borderColor : defaultTheme.colors.yellow[300],
				boxShadow   : ` 0 0 0 3px ${hexToRGBA(defaultTheme.colors.yellow[300], 0.45)}`,
			},
			'&:hover'  : {
				backgroundColor : defaultTheme.colors.yellow[500],
				borderColor     : defaultTheme.colors.yellow[500],
			},
			'&:active' : {
				backgroundColor : hexToRGBA(defaultTheme.colors.yellow[400]),
			},
		},
		'&.btn-outline-warning' : {
			backgroundColor : 'transparent',
			borderColor     : defaultTheme.colors.yellow[600],
			//color           : defaultTheme.colors.gray[900],
			color           : defaultTheme.colors.yellow[600],
			
			'&:focus'  : {
				outline     : 0,
				borderColor : defaultTheme.colors.yellow[300],
				boxShadow   : ` 0 0 0 3px ${hexToRGBA(defaultTheme.colors.yellow[300], 0.45)}`,
			},
			'&:hover'  : {
				backgroundColor : defaultTheme.colors.yellow[600],
				color           : defaultTheme.colors.white,
			},
			'&:active' : {
				backgroundColor : defaultTheme.colors.yellow[600],
			},
		},
		
		'&.btn-info'         : {
			backgroundColor : defaultTheme.colors.blue[400],
			borderColor     : defaultTheme.colors.blue[400],
			color           : defaultTheme.colors.blue[900],
			
			'&:focus'  : {
				outline     : 0,
				borderColor : defaultTheme.colors.blue[100],
				boxShadow   : ` 0 0 0 3px ${hexToRGBA(defaultTheme.colors.blue[100], 0.45)}`,
			},
			'&:hover'  : {
				backgroundColor : defaultTheme.colors.blue[300],
				borderColor     : defaultTheme.colors.blue[300],
			},
			'&:active' : {
				backgroundColor : hexToRGBA(defaultTheme.colors.blue[200]),
			},
		},
		'&.btn-outline-info' : {
			backgroundColor : 'transparent',
			borderColor     : defaultTheme.colors.blue[400],
			color           : defaultTheme.colors.blue[400],
			
			'&:focus'  : {
				outline     : 0,
				borderColor : defaultTheme.colors.blue[100],
				boxShadow   : ` 0 0 0 3px ${hexToRGBA(defaultTheme.colors.blue[100], 0.45)}`,
			},
			'&:hover'  : {
				color           : defaultTheme.colors.white,
				backgroundColor : defaultTheme.colors.blue[400],
			},
			'&:active' : {
				backgroundColor : defaultTheme.colors.blue[400],
			},
		},
		
		'&.btn-light'         : {
			backgroundColor : defaultTheme.colors.gray[200],
			borderColor     : defaultTheme.colors.gray[200],
			color           : defaultTheme.colors.gray[900],
			
			'&:focus'  : {
				outline     : 0,
				borderColor : defaultTheme.colors.gray[100],
				boxShadow   : ` 0 0 0 3px ${hexToRGBA(defaultTheme.colors.gray[100], 0.45)}`,
			},
			'&:hover'  : {
				color : defaultTheme.colors.gray[800],
			},
			'&:active' : {
				backgroundColor : hexToRGBA(defaultTheme.colors.gray[100]),
			},
		},
		'&.btn-outline-light' : {
			backgroundColor : 'transparent',
			borderColor     : defaultTheme.colors.gray[400],
			color           : defaultTheme.colors.gray[400],
			
			'&:focus'  : {
				outline     : 0,
				borderColor : defaultTheme.colors.gray[100],
				boxShadow   : ` 0 0 0 3px ${hexToRGBA(defaultTheme.colors.gray[100], 0.45)}`,
			},
			'&:hover'  : {
				backgroundColor : defaultTheme.colors.gray[400],
				color           : defaultTheme.colors.white,
			},
			'&:active' : {
				backgroundColor : defaultTheme.colors.gray[400],
			},
		},
		
		'&.btn-dark'         : {
			backgroundColor : defaultTheme.colors.gray[900],
			borderColor     : defaultTheme.colors.gray[900],
			color           : defaultTheme.colors.white,
			
			'&:focus'  : {
				outline     : 0,
				borderColor : defaultTheme.colors.gray[600],
				boxShadow   : ` 0 0 0 3px ${hexToRGBA(defaultTheme.colors.gray[600], 0.45)}`,
			},
			'&:hover'  : {
				backgroundColor : defaultTheme.colors.gray[800],
				borderColor     : defaultTheme.colors.gray[800],
			},
			'&:active' : {
				backgroundColor : hexToRGBA(defaultTheme.colors.gray[700]),
			},
		},
		'&.btn-outline-dark' : {
			backgroundColor : 'transparent',
			borderColor     : defaultTheme.colors.gray[900],
			color           : defaultTheme.colors.gray[900],
			
			'&:focus'  : {
				outline     : 0,
				borderColor : defaultTheme.colors.gray[600],
				boxShadow   : ` 0 0 0 3px ${hexToRGBA(defaultTheme.colors.gray[600], 0.45)}`,
			},
			'&:hover'  : {
				color           : defaultTheme.colors.white,
				backgroundColor : defaultTheme.colors.gray[900],
			},
			'&:active' : {
				backgroundColor : defaultTheme.colors.gray[900],
			},
		},
		
		'&.btn-link' : {
			color           : defaultTheme.colors.blue[600],
			border          : 'none',
			backgroundColor : 'transparent',
			
			'&:focus'  : {
				textDecoration : 'underline',
				outline        : 0,
				borderColor    : defaultTheme.colors.blue[600],
				boxShadow      : ` 0 0 0 3px ${hexToRGBA(defaultTheme.colors.blue[600], 0.45)}`,
			},
			'&:hover'  : {
				textDecoration : 'underline',
			},
			'&:active' : {
				backgroundColor : 'transparent',
			},
		},
	},
	well        : {
		padding      : defaultTheme.spacing[4],
		border       : `1px solid ${defaultTheme.colors.gray[200]}`,
		borderRadius : defaultTheme.borderRadius['md'],
		background   : defaultTheme.colors.white,
	},
	typography  : {
		h1 : {
			fontSize   : defaultTheme.fontSize['4xl'],
			lineHeight : defaultTheme.lineHeight.tight,
			fontWeight : defaultTheme.fontWeight.medium,
		},
		h2 : {
			fontSize   : defaultTheme.fontSize['3xl'],
			lineHeight : defaultTheme.lineHeight.tight,
			fontWeight : defaultTheme.fontWeight.medium,
		},
		h3 : {
			fontSize   : defaultTheme.fontSize['2xl'],
			lineHeight : defaultTheme.lineHeight.tight,
			fontWeight : defaultTheme.fontWeight.medium,
		},
		h4 : {
			fontSize   : defaultTheme.fontSize['xl'],
			lineHeight : defaultTheme.lineHeight.tight,
			fontWeight : defaultTheme.fontWeight.medium,
		},
		h5 : {
			fontSize   : defaultTheme.fontSize['lg'],
			lineHeight : defaultTheme.lineHeight.tight,
			fontWeight : defaultTheme.fontWeight.medium,
		},
		h6 : {
			fontSize   : defaultTheme.fontSize['base'],
			lineHeight : defaultTheme.lineHeight.tight,
			fontWeight : defaultTheme.fontWeight.medium,
		},
		
		display : {
			
			1 : {
				fontSize   : fontSize['d-1'],
				fontWeight : defaultTheme.fontWeight['light'],
				lineHeight : defaultTheme.lineHeight['loose'],
			},
			2 : {
				fontSize   : fontSize['d-2'],
				fontWeight : defaultTheme.fontWeight['light'],
				lineHeight : defaultTheme.lineHeight['loose'],
			},
			3 : {
				fontSize   : fontSize['d-3'],
				fontWeight : defaultTheme.fontWeight['light'],
				lineHeight : defaultTheme.lineHeight['loose'],
			},
			4 : {
				fontSize   : fontSize['d-4'],
				fontWeight : defaultTheme.fontWeight['light'],
				lineHeight : defaultTheme.lineHeight['loose'],
			},
		}
	},
	table       : {
		default : {
			width : '100%',
			
			thead : {
				color             : defaultTheme.colors.gray[700],
				backgroundColor   : defaultTheme.colors.gray[200],
				border            : 'none',
				borderBottomWidth : '2px',
				borderBottomStyle : 'solid',
				borderBottomColor : defaultTheme.colors.gray[300],
				tr                : {
					th : {
						fontSize      : defaultTheme.fontSize['xs'],
						fontWeight    : defaultTheme.fontWeight['medium'],
						textTransform : 'uppercase',
					}
				}
			},
			
			tr : {
				borderBottomWidth : '1px',
				borderBottomStyle : 'solid',
				borderBottomColor : defaultTheme.colors.gray[200],
				
				'th, td' : {
					textAlign : 'left',
					padding   : defaultTheme.padding[2],
					border    : 'none',
				}
			},
		},
		
		striped : {
			tbody : {
				'tr:nth-child(even)' : {
					backgroundColor : defaultTheme.colors.gray[100],
				}
			}
		},
		
		hover : {
			tbody : {
				'tr:hover' : {
					backgroundColor : defaultTheme.colors.gray[200],
				}
			}
		},
		
		responsive : {
			overflowX : 'auto',
			table     : {
				overflowX : 'hidden',
			}
		},
		
		borderless : {
			tr    : {
				borderBottom : 'none',
			},
			thead : {
				borderBottom : 'none'
			}
		},
		
		bordered : {
			'th, td' : {
				borderWidth : `${defaultTheme.borderWidth.default} !important`,
				borderStyle : 'solid !important',
				borderColor : `${defaultTheme.borderColor.default} !important`,
			},
		},
	},
	cards       : {
		
		card : {
			borderWidth     : defaultTheme.borderWidth.default,
			borderStyle     : 'solid',
			borderColor     : defaultTheme.borderColor.default,
			borderRadius    : defaultTheme.borderRadius['md'],
			backgroundColor : defaultTheme.backgroundColor.white,
			overflow        : 'hidden',
			boxShadow      : defaultTheme.boxShadow['sm'],
			
			'&.no-shadow' : {
				boxShadow : 'none',
			},
			
			cardImage : {
				width : '100%'
			},
			
			cardHeader : {
				borderBottomWidth : defaultTheme.borderWidth.default,
				borderBottomStyle : 'solid',
				borderBottomColor : defaultTheme.borderColor.default,
				padding           : defaultTheme.padding[5],
				fontWeight        : defaultTheme.fontWeight['medium'],
				color             : defaultTheme.colors.gray[900],
				fontSize          : defaultTheme.fontSize['sm'],
			},
			
			cardBody : {
				padding : defaultTheme.padding[5],
			},
			
			cardFooter : {
				borderTopWidth : defaultTheme.borderWidth.default,
				borderTopStyle : 'solid',
				borderTopColor : defaultTheme.borderColor.default,
				padding        : defaultTheme.padding[5],
				fontWeight     : defaultTheme.fontWeight['medium'],
				color          : defaultTheme.colors.gray[900],
				fontSize       : defaultTheme.fontSize['sm'],
			},
			
			cardTitle : {
				marginBottom : defaultTheme.margin[2],
				color        : defaultTheme.colors.gray[900],
			},
			
			cardSubTitle : {
				color        : defaultTheme.colors.gray[600],
				marginTop    : defaultTheme.margin['-2'],
				marginBottom : defaultTheme.margin[1],
				fontSize     : defaultTheme.fontSize['sm'],
				fontWeight   : defaultTheme.fontWeight['normal'],
			}
		}
		
	},
	listGroup   : {
		borderRadius : defaultTheme.borderRadius['md'],
		borderWidth  : defaultTheme.borderWidth.default,
		borderStyle  : 'solid',
		borderColor  : defaultTheme.borderColor.default,
		
		'&.list-group-flush' : {
			border : 'none'
		},
		
		'> .list-group-item' : {
			display           : 'block',
			padding           : defaultTheme.padding[3],
			borderBottomWidth : defaultTheme.borderWidth.default,
			borderBottomStyle : 'solid',
			borderBottomColor : defaultTheme.borderColor.default,
			
			'&:last-child' : {
				borderBottom : 'none'
			},
			
			'&.list-group-item-action' : {
				cursor : 'pointer',
				width  : '100%',
				
				'&:hover,&:focus' : {
					backgroundColor : defaultTheme.colors.gray[100],
				},
				'&:active'        : {
					backgroundColor : defaultTheme.colors.gray[200],
				},
			},
			
			'&.active' : {
				backgroundColor : defaultTheme.colors.blue[500],
				color           : defaultTheme.colors.white,
				
				'&:hover,&:focus' : {
					backgroundColor : defaultTheme.colors.blue[500],
				},
				'&:active'        : {
					backgroundColor : defaultTheme.colors.blue[500],
				},
			}
		}
	}
};

function merge(...options)
{
	function mergeCustomizer(objValue, srcValue, key, obj, src, stack)
	{
		if (isPlainObject(srcValue)) {
			return mergeWith(objValue, srcValue, mergeCustomizer);
		}
		return Object.keys(src).includes(key)
			// Convert undefined to null otherwise lodash won't replace the key
			// PostCSS still omits properties with a null value so it behaves
			// the same as undefined.
			? (srcValue === undefined ? null : srcValue)
			: objValue;
	}
	
	return mergeWith({}, ...options, mergeCustomizer);
}

function flattenOptions(options)
{
	return merge(...flatMap(toPairs(options), ([keys, value]) => {
		return fromPairs(keys.split(', ').map(key => [key, value]));
	}));
}

function resolveOptions(userOptions)
{
	return merge({
		default : defaultOptions,
	}, fromPairs(map(userOptions, (value, key) => [key, flattenOptions(value)])));
}

function replaceIconDeclarations(component, replace)
{
	return traverse(component).map(function (value) {
		if (!isPlainObject(value)) {
			return;
		}
		
		if (Object.keys(value).includes('iconColor') || Object.keys(value).includes('icon')) {
			const {iconColor, icon, ...rest} = value;
			this.update(merge(replace({icon, iconColor}), rest));
		}
	});
}

module.exports = function ({addUtilities, addBase, addComponents, theme, postcss}) {
	function addFormGroup(options)
	{
		if (isEmpty(options)) {
			return;
		}
		addComponents({[`.form-group`] : options.group});
		addComponents({[`.form-group-inline`] : options.inline});
		addBase({[`label`] : options.label});
		addBase({[`label`] : options.label});
	}
	
	function addCards(options)
	{
		if (isEmpty(options)) {
			return;
		}
		
		addComponents({[`.card`] : options.card});
		addComponents({[`.card-header`] : options.card.cardHeader});
		addComponents({[`.card-body`] : options.card.cardBody});
		addComponents({[`.card-footer`] : options.card.cardFooter});
		addComponents({[`.card-image`] : options.card.cardImage});
		addComponents({[`.card-title`] : options.card.cardTitle});
		addComponents({[`.card-subtitle`] : options.card.cardSubTitle});
	}
	
	function addListGroup(options)
	{
		if (isEmpty(options)) {
			return;
		}
		
		addComponents({[`.list-group`] : options});
	}
	
	function addTable(options)
	{
		if (isEmpty(options)) {
			return;
		}
		addComponents({[`.table`] : options.default});
		addComponents({[`.table-striped`] : options.striped});
		addComponents({[`.table-hover`] : options.hover});
		addComponents({[`.table-responsive`] : options.responsive});
		addComponents({[`.table-borderless`] : options.borderless});
		addComponents({[`.table-bordered`] : options.bordered});
	}
	
	function addWell(options, modifier = '')
	{
		if (isEmpty(options)) {
			return;
		}
		
		addComponents({[`.well`] : options});
	}
	
	function addTypography(options, modifier = '')
	{
		if (isEmpty(options)) {
			return;
		}
		
		addBase({[`h1`] : options.h1});
		addBase({[`h2`] : options.h2});
		addBase({[`h3`] : options.h3});
		addBase({[`h4`] : options.h4});
		addBase({[`h5`] : options.h5});
		addBase({[`h6`] : options.h6});
		
		addComponents({['.display-1'] : options.display[1]});
		addComponents({['.display-2'] : options.display[2]});
		addComponents({['.display-3'] : options.display[3]});
		addComponents({['.display-4'] : options.display[4]});
	}
	
	function addButton(options, modifier = '')
	{
		if (isEmpty(options)) {
			return;
		}
		
		addComponents({[`.btn`] : options});
		addComponents({[`.btn-primary`] : options});
		addComponents({[`.btn-secondary`] : options});
		addComponents({[`.btn-success`] : options});
		addComponents({[`.btn-danger`] : options});
		addComponents({[`.btn-info`] : options});
		addComponents({[`.btn-warning`] : options});
		addComponents({[`.btn-light`] : options});
		addComponents({[`.btn-dark`] : options});
		addComponents({[`.btn-link`] : options});
		addComponents({[`.btn-outline-primary`] : options});
		addComponents({[`.btn-outline-secondary`] : options});
		addComponents({[`.btn-outline-success`] : options});
		addComponents({[`.btn-outline-danger`] : options});
		addComponents({[`.btn-outline-info`] : options});
		addComponents({[`.btn-outline-warning`] : options});
		addComponents({[`.btn-outline-light`] : options});
		addComponents({[`.btn-outline-dark`] : options});
	}
	
	function addInput(options, modifier = '')
	{
		if (isEmpty(options)) {
			return;
		}
		
		addBase({[`input`] : options});
	}
	
	function addTextarea(options, modifier = '')
	{
		if (isEmpty(options)) {
			return;
		}
		
		addBase({[`textarea`] : options});
	}
	
	function addMultiselect(options, modifier = '')
	{
		if (isEmpty(options)) {
			return;
		}
		
		addBase({[`multiselect`] : options});
	}
	
	function addSelect(options, modifier = '')
	{
		if (isEmpty(options)) {
			return;
		}
		
		addBase(replaceIconDeclarations({
			[`select`] : merge({
				'&::-ms-expand' : {
					color : options.iconColor,
				},
				...isUndefined(options.paddingLeft) ? {} : {
					'@media print and (-ms-high-contrast: active), print and (-ms-high-contrast: none)' : {
						paddingRight : options.paddingLeft, // Fix padding for print in IE
					},
				},
			}, options)
		}, ({icon = options.icon, iconColor = options.iconColor}) => {
			return {
				backgroundImage : `url("${svgToDataUri(isFunction(icon) ? icon(iconColor) : icon)}")`
			};
		}));
	}
	
	function addCheckbox(options, modifier = '')
	{
		if (isEmpty(options)) {
			return;
		}
		
		addComponents(replaceIconDeclarations({
			[`.checkbox${modifier}`] : merge({
				...isUndefined(options.borderWidth) ? {} : {
					'&::-ms-check' : {
						'@media not print' : {
							borderWidth : options.borderWidth,
						}
					},
				},
			}, options)
		}, ({icon = options.icon, iconColor = options.iconColor}) => {
			return {
				'&:checked' : {
					backgroundImage : `url("${svgToDataUri(isFunction(icon) ? icon(iconColor) : icon)}")`
				}
			};
		}));
	}
	
	function addRadio(options, modifier = '')
	{
		if (isEmpty(options)) {
			return;
		}
		
		addComponents(replaceIconDeclarations({
			[`.radio${modifier}`] : merge({
				...isUndefined(options.borderWidth) ? {} : {
					'&::-ms-check' : {
						'@media not print' : {
							borderWidth : options.borderWidth,
						}
					},
				},
			}, options)
		}, ({icon = options.icon, iconColor = options.iconColor}) => {
			return {
				'&:checked' : {
					backgroundImage : `url("${svgToDataUri(isFunction(icon) ? icon(iconColor) : icon)}")`
				}
			};
		}));
	}
	
	function registerComponents()
	{
		const options = resolveOptions(theme('bootstrapReplacement'));
		
		addFormGroup(options.default.formGroup);
		addListGroup(options.default.listGroup);
		addCards(options.default.cards);
		addTable(options.default.table);
		addTypography(options.default.typography);
		addButton(options.default.button);
		addWell(options.default.well);
		addInput(options.default.input);
		addTextarea(options.default.textarea);
		addMultiselect(options.default.multiselect);
		addSelect(options.default.select);
		addCheckbox(options.default.checkbox);
		addRadio(options.default.radio);
		
		Object.keys((({default : _default, ...rest}) => rest)(options)).forEach(key => {
			const modifier = `-${key}`;
			
			addListGroup(options[key].listGroup || {}, modifier);
			addFormGroup(options[key].cards || {}, modifier);
			addFormGroup(options[key].formGroup || {}, modifier);
			addTable(options[key].table || {}, modifier);
			addTypography(options[key].typography || {}, modifier);
			addButton(options[key].button || {}, modifier);
			addWell(options[key].well || {}, modifier);
			addInput(options[key].input || {}, modifier);
			addTextarea(options[key].textarea || {}, modifier);
			addMultiselect(options[key].multiselect || {}, modifier);
			addSelect(options[key].select || {}, modifier);
			addCheckbox(options[key].checkbox || {}, modifier);
			addRadio(options[key].radio || {}, modifier);
		});
	}
	
	registerComponents();
};
