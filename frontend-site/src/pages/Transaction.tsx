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

const Transaction: React.FC = () => {

  const { transactionHash } = useParams()

  let { data: transaction, error, isLoading } = API.useTransaction(transactionHash);

  const convertHexToDecimal = (hexString: string): string => {
    const decimalNumber = parseInt(hexString, 16);
    return decimalNumber.toString();
  };

  const convertHexToGigaDecimal = (hexString: string): string => {
    const gigaDecimalNumber = parseInt(hexString, 16) / 1000000;
    return gigaDecimalNumber.toString();
  };

  const beautifyLongList = (list: string): string => {
    const items = list.split(',');
    const beautifiedList = items.map(item => item.trim()).join('\n');
    return beautifiedList;
  };
  
  const tableData = [
    { label: 'Block Number', value: <CustomLink to={`/block/${transaction?.block_number}`}>{transaction?.block_number}</CustomLink> },
    { label: 'Transaction Hash', value: <CustomLink to={`/transaction/${transaction?.transaction_hash}`}>{transaction?.transaction_hash}</CustomLink> },
    { label: 'Type', value: <Tag colorScheme="blue">{transaction?.type}</Tag> },
    { label: 'Version', value: <Tag colorScheme="blue">{transaction?.version}</Tag> },
    { label: 'Nonce', value: transaction?.nonce ? convertHexToDecimal(transaction.nonce.toString()) : '-' },
    { label: 'Sender Address', value: transaction?.sender_address },
    { label: 'Signature', value: transaction?.signature ? beautifyLongList(transaction.signature) : '-' },
    { label: 'Calldata', value: transaction?.calldata ? beautifyLongList(transaction.calldata) : '-' },
    { label: 'L1 Gas Max Amount', value: transaction?.l1_gas_max_amount ? convertHexToGigaDecimal(transaction.l1_gas_max_amount) + ' GWei' : '-' },
    { label: 'L1 Gas Max Price Per Unit', value: transaction?.l1_gas_max_price_per_unit ? convertHexToGigaDecimal(transaction.l1_gas_max_price_per_unit) + ' GWei' : '-' },
    { label: 'L2 Gas Max Amount', value: transaction?.l2_gas_max_amount ? convertHexToGigaDecimal(transaction.l2_gas_max_amount) + ' GFri' : '-' },
    { label: 'L2 Gas Max Price Per Unit', value: transaction?.l2_gas_max_price_per_unit ? convertHexToGigaDecimal(transaction.l2_gas_max_price_per_unit) + ' GFri' : '-' },
    { label: 'Tip', value: transaction?.tip ? convertHexToGigaDecimal(transaction.tip) + 'GWei' : '-' },
    { label: 'Paymaster Data', value: transaction?.paymaster_data ? transaction.paymaster_data : '-' },
    { label: 'Account Deployment Data', value: transaction?.account_deployment_data ? transaction.account_deployment_data : '-' },
    { label: 'Nonce Data Availability Mode', value: transaction?.nonce_data_availability_mode ? transaction.nonce_data_availability_mode : '-' },
    { label: 'Fee Data Availability Mode', value: transaction?.fee_data_availability_mode ? transaction.fee_data_availability_mode : '-' },
    { label: 'Max Fee', value: transaction?.max_fee },
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
          : transaction 
          && <Stack align="center">
            <Text>Transaction <CustomLink to={`/transaction/${transaction?.transaction_hash}`}>{transaction?.transaction_hash}</CustomLink></Text>
            <TableContainer>
              <Table variant='simple'>
                <TableCaption>Transaction details</TableCaption>
                <Tbody>
                  {tableData.map((row, index) => (
                    <Tr key={index}>
                      <Th>{row.label}:</Th>
                      <Td style={{ maxWidth: '100vw', wordWrap: 'break-word', whiteSpace: 'normal' }}>{row.value}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Stack>
    }
  </Stack>
}

export default Transaction
