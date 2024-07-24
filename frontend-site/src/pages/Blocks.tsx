import React, { useState } from "react";
import { Spinner, Stack, Tag, Text, Table, Thead, Tbody, Tr, Th, TableCaption, TableContainer } from "@chakra-ui/react";
import API from "../utils/API";
import { useParams } from "react-router-dom";
import CustomLink from '../components/CustomLink';
import { shortString } from "../utils";
import Paginator from "../components/Paginator";
import { validPageSizes } from "../../../common/src/blocks"

const Blocks: React.FC = () => {
  const { ps, p } = useParams();
  const [pageSize, setPageSize] = useState<number>(parseInt(ps ?? '10'));
  const [pageNumber, setPageNumber] = useState<number>(parseInt(p ?? '1'));

  const { data, error, isLoading } = API.useBlocks({ ps: pageSize.toString(), p: pageNumber.toString() });

  console.log(data?.meta.totalPages)

  const convertTimestamp = (timestamp: string): string => {
    const date = new Date(Number(timestamp) * 1000);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short', day: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    };
    const formattedTime = date.toLocaleTimeString('en-US', options);

    return `${formattedTime}`;
  };

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
              <Text>Blocks</Text>
              <TableContainer>
                <Table variant='simple'>
                  <TableCaption>Latest Blocks on voyager</TableCaption>
                  <Thead>
                    <Tr>
                      <Th>No.</Th>
                      <Th>Block Hash</Th>
                      <Th>Status</Th>
                      <Th>TimeStamp</Th>
                      <Th>Starknet Version</Th>
                      <Th>L1 DA Mode</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {
                      data?.rows.map(block => {
                        return <Tr key={block.block_number}>
                          <Th>{block.block_number}</Th>
                          <Th>
                            <CustomLink to={`/block/${block.block_number}`}>
                              {shortString(block.block_hash)}
                            </CustomLink>
                          </Th>
                          <Th>
                            <Tag colorScheme="green">
                              {block.status}
                            </Tag>
                          </Th>
                          <Th>{convertTimestamp(block.timestamp)}</Th>
                          <Th><Tag colorScheme={"blue"}>{block.starknet_version}</Tag></Th>
                          <Th><Tag colorScheme={"blue"}>{block.l1_da_mode}</Tag></Th>
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

export default Blocks;
