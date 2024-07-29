import React, { useState } from "react";
import { Spinner, Stack, Tag, Text, Table, Thead, Tbody, Tr, Th, TableCaption, TableContainer } from "@chakra-ui/react";
import API from "../utils/API";
import { useParams } from "react-router-dom";
import CustomLink from '../components/CustomLink';
import { shortString } from "../utils";
import Paginator from "../components/Paginator";
import { validPageSizes } from "../../../common/src/blocks"

const Transactions: React.FC = () => {
  const { ps, p } = useParams();

  const initialPageSize = validPageSizes.includes(parseInt(ps ?? '10')) ? parseInt(ps ?? '10') : 10;
  const initialPageNumber = parseInt(p ?? '1');

  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [pageNumber, setPageNumber] = useState<number>(initialPageNumber);

  const { data, error, isLoading } = API.useTransactions({ ps: pageSize.toString(), p: pageNumber.toString() });

  console.log(data?.meta.totalPages)

  const handlePageSizeChange = (newPageSize: number) => {
    if (validPageSizes.includes(newPageSize)) {
      setPageSize(newPageSize);
      setPageNumber(1);
    } else {
      alert(`Invalid page size. Valid options are: ${validPageSizes.join(", ")}`);
    }
  };

  const handlePageChange = (newPageNumber: number) => {
    if (newPageNumber >= 1) {
      setPageNumber(newPageNumber);
    } else {
      alert("Page number must be a positive integer");
    }
  };

  return (
    <Stack>
      {
        isLoading
          ? <Spinner />
          : error
            ? <Stack>
              <Text>{error?.message ?? "Failed to fetch blocks"}</Text>
            </Stack>
            : <Stack alignItems={"center"} justifyContent={"center"}>
              <Text>Transactions</Text>
              <TableContainer>
                <Table variant='simple'>
                  <TableCaption>Latest Transactions on voyager</TableCaption>
                  <Thead>
                    <Tr>
                      <Th>Block No.</Th>
                      <Th>Transaction Hash</Th>
                      <Th>Type</Th>
                      <Th>Version</Th>
                      <Th>Sender address</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {
                      data?.rows.map(transaction => {
                        return <Tr key={transaction.block_number}>
                          <Th>
                            <CustomLink to={`/block/${transaction.block_number}`}>
                              {transaction.block_number}
                            </CustomLink>
                          </Th>
                          <Th>
                            <CustomLink to={`/transaction/${transaction.transaction_hash}`}>
                              {shortString(transaction.transaction_hash)}
                            </CustomLink>
                          </Th>
                          <Th>
                            <Tag colorScheme="blue">
                              {transaction.type}
                            </Tag>
                          </Th>
                          <Th><Tag colorScheme={"blue"}>{transaction.version}</Tag></Th>
                          <Th>{ transaction.sender_address }</Th>
                        </Tr>
                      })
                    }
                  </Tbody>
                </Table>
              </TableContainer>
              <Paginator
                pageNumber={pageNumber}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </Stack>
      }
    </Stack>
  );
}

export default Transactions;
