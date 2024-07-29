import React from "react";
import { Spinner, Stack, Text } from "@chakra-ui/react";
import API from "../utils/API";
import { useParams } from "react-router-dom";
import {
  TableContainer,
  TableCaption,
  Table,
  Tbody,
  Tag,
  Tr,
  Td,
  Th,
} from '@chakra-ui/react'
import CustomLink from "../components/CustomLink";

const Block: React.FC = () => {

  const { blockNumber } = useParams()

  const isBlockHash = blockNumber?.startsWith("0x");

  let block, error, isLoading;

  if (isBlockHash) {
    ({ data: block, error, isLoading } = API.useBlockHash(blockNumber));
  } else {
    ({ data: block, error, isLoading } = API.useBlock(blockNumber));
  }

  console.log(block?.l1_gas_price_price_in_wei)

  const convertTimestampToDateTime = (timestamp: string): string => {
    console.log(timestamp);
    const date = new Date(Number(timestamp) * 1000);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short', day: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    };
    const formattedTime = date.toLocaleTimeString('en-US', options);
    return `${formattedTime}`;
  };

  const convertHexToGigaDecimal = (hexString: string): string => {
    const gigaDecimalNumber = parseInt(hexString, 16) / 1000000;
    return gigaDecimalNumber.toString();
  };
  
  const tableData = [
    { label: 'Block Hash', value: <CustomLink to={`/block/${block?.block_hash}`}>{block?.block_hash}</CustomLink> },
    { label: 'Status', value: <Tag colorScheme="green">{block?.status}</Tag> },
    { label: 'Parent Hash', value: <CustomLink to={`/block/${block?.parent_hash}`}>{block?.parent_hash}</CustomLink> },
    { label: 'New Root', value: block?.new_root },
    { label: 'Timestamp', value: block ? convertTimestampToDateTime(block.timestamp) : '' },
    { label: 'Starknet Version', value: <Tag colorScheme="blue">{block?.starknet_version}</Tag> },
    { label: 'L1 DA Mode', value: <Tag colorScheme="blue">{block?.l1_da_mode}</Tag> },
    { label: 'Sequencer Address', value: block?.sequence_address },
    { label: 'ETH Gas Price', value: block ? `${convertHexToGigaDecimal(block.l1_gas_price_price_in_wei)} Gwei` : '' },
    { label: 'STRK Gas Price', value: block ? `${convertHexToGigaDecimal(block.l1_gas_price_price_in_fri)} Gfri` : '' },
    { label: 'ETH Data Gas Price', value: block ? `${convertHexToGigaDecimal(block.l1_data_gas_price_price_in_wei)} Gwei` : '' },
    { label: 'STRK Data Gas Price', value: block ? `${convertHexToGigaDecimal(block.l1_data_gas_price_price_in_fri)} Gfri` : '' },
  ];

  return <Stack>
    {
      isLoading 
        ? <Spinner /> 
        : error 
          ? <Stack>
            <Text color={"red"}>{error?.status}</Text>
            <Text color={"red"}>{error?.message}</Text>
          </Stack>
          : block 
          && <Stack align="center">
            {/* <Text>Block #{block.block_number}</Text> */}
            <Text>Block #<CustomLink to={`/block/${block.block_number}`}>{block.block_number}</CustomLink></Text>
            <TableContainer>
              <Table variant='simple'>
                <TableCaption>Block details</TableCaption>
                <Tbody>
                  {tableData.map((row, index) => (
                    <Tr key={index}>
                      <Th>{row.label}:</Th>
                      <Td>{row.value}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Stack>
    }
  </Stack>
}

export default Block
