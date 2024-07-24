# Minitaure Voyager

This repo is a miniature version of voyager to get you started with basics on explorer and data storage and consumption.


## Components of Voyager
- ETLs or Indexers 
    - These pieces of code helps in getting the data from RPC Nodes of starknet.
    - Process data fetched from Nodes and Store them in expected form for consumption from Backend Services
- Database
    - This is storage for all the data which is fed from ETLs and consumed by Backend Services (such as api-services)
    - In voyager we use `postgresql` as our sole database, but for miniature version we will make use of `sqlite3`. 
    - We don't use any ORMs so `SQL` is our friend
- Backend Services
    - Consumer of database to serve data to various clients, currently we only support to serve REST API Client
    - In voyager, it serves all the data which we visit on `voyager.online`
- Frontend 
    - All of project is currently setup in react   
    - `frontend-site` is the folder which has all the user facing interface's with data fetching.
    - In voyager frontend also consists of a design system which is inside folder `packages/design-system`


## Goals for exercises
- Goal for these exercises to help you understand how voyager works on a higher level. 


## Pre-requisites
- nodejs v20+ [here](https://nodejs.org/en/download) 
- pnpm [here](https://pnpm.io/) 
- pm2 [here](https://pm2.keymetrics.io/docs/usage/quick-start/) 


## Folder structure
- `database`
    - all the code concerning creation of tables and making a database instance to be user in `etls` and `api-services`
- `api-services`
    - all the code to serve the data from database to end client (in our case it would be frontend site) 
    - it's a simple express server which serves the endpoints according to file structure, initally only blocks endpoint is built to start with
- `etl`
    - all the code which concerns feeding data from blockchain to database lives here
    - currently it only implements `blocks` which feeds block data to database
    - etls uses pm2 to manage long running process which runs `blocks` app every minute. (you can always tweak it in ecosystem file, which you can read about in pm2 docs)
- `frontend-site`
    - all of the code concerning UI and user facing application goes inside here
    - at voyager we have a custom design system, but to start we use `chakra-ui` in this project
    - currently only `blocks` table and `block` details page are partially implemented, additional routes are present such as `transactions` but these are not implemented.
- `common`
    - as name suggests this is a common package, which serves a common interface for typesafety to frontend-site and api-services, this makes it easier on UI to get types which api-services respond with for each endpoint

## Important Commands
Although this is just a pnpm workspace and each package has it's own `package.json` file which you can refer to see which commands to run. But before exploring running few commands will make our life easier such as installing dependencies and building common packages.

- Install all dependencies
    - `pnpm i`
- Build Common Packages
    - `pnpm build:packages`
- Start ETLs
    - `pnpm etl`
- Start API service
    - `pnpm api`
- Start Frontend Application
    - `pnpm fe`
