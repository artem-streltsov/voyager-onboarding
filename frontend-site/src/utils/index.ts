export const shortString = (str: string, start: number = 5, end: number = 5) => {
	if(!str) return str
	if(str && str.length < start + end) return str;
	return `${str.substring(0, start)}...${str.substring(str.length - end, str.length-1)}`
} 
