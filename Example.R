install.packages('rsconnect')
rsconnect::setAccountInfo(name='aldrich',
			  token='9DA0CE399FCB080901250A1800FF13FD',
			  secret='<SECRET>')
library(rsconnect)
rsconnect::deployApp('path/to/your/app')