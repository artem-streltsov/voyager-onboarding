import React, { useEffect, useState } from "react";
import {
  Spinner,
  Stack,
  Tag,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  TableCaption,
  TableContainer,
} from "@chakra-ui/react";
import API from "../utils/API";
import { useParams, useNavigate } from "react-router-dom";
import CustomLink from "../components/CustomLink";
import { shortString } from "../utils";
import Paginator from "../components/Paginator";
import { validPageSizes } from "../../../common/src/blocks";

const Blocks: React.FC = () => {
  const { ps, p } = useParams();
  const navigate = useNavigate();

  const initialPageSize = validPageSizes.includes(parseInt(ps ?? "10"))
    ? parseInt(ps ?? "10")
    : 10;
  const initialPageNumber = parseInt(p ?? "1");

  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [pageNumber, setPageNumber] = useState<number>(initialPageNumber);

  const { data, error, isLoading } = API.useBlocks({
    ps: pageSize.toString(),
    p: pageNumber.toString(),
  });

  const totalPages = data?.meta.totalPages;

  const convertTimestamp = (timestamp: string): string => {
    const date = new Date(Number(timestamp) * 1000);
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    const formattedTime = date.toLocaleTimeString("en-US", options);

    return `${formattedTime}`;
  };

  // Effect to synchronize URL params with state changes
  useEffect(() => {
    navigate(`/blocks?ps=${pageSize}&p=${pageNumber}`);
  }, [pageSize, pageNumber, navigate]);

  const handlePageSizeChange = (newPageSize: number) => {
    if (validPageSizes.includes(newPageSize)) {
      setPageSize(newPageSize);
      setPageNumber(1); // Reset to the first page when page size changes
    } else {
      alert(`Invalid page size. Valid options are: ${validPageSizes.join(", ")}`);
    }
  };

  const handlePageChange = (newPageNumber: number) => {
    if (newPageNumber >= 1 && newPageNumber <= (totalPages || 1)) {
      setPageNumber(newPageNumber);
    } else {
      alert("Page number must be a positive integer and within range");
    }
  };

  return (
    <Stack>
      {isLoading ? (
        <Spinner />
      ) : error ? (
        <Stack>
          <Text>{error?.message ?? "Failed to fetch blocks"}</Text>
        </Stack>
      ) : (
        <Stack alignItems={"center"} justifyContent={"center"}>
          <Text>Blocks</Text>
          <TableContainer>
            <Table variant="simple">
              <TableCaption>Latest Blocks on Voyager</TableCaption>
              <Thead>
                <Tr>
                  <Th>No.</Th>
                  <Th>Block Hash</Th>
                  <Th>Status</Th>
                  <Th>Timestamp</Th>
                  <Th>Starknet Version</Th>
                  <Th>L1 DA Mode</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data?.rows.length === 0 ? (
                  <Tr>
                    <Th colSpan={6} textAlign="center">
                      No blocks available.
                    </Th>
                  </Tr>
                ) : (
                  data?.rows.map((block) => (
                    <Tr key={block.block_number}>
                      <Th>{block.block_number}</Th>
                      <Th>
                        <CustomLink to={`/block/${block.block_number}`}>
                          {shortString(block.block_hash)}
                        </CustomLink>
                      </Th>
                      <Th>
                        <Tag colorScheme="green">{block.status}</Tag>
                      </Th>
                      <Th>{convertTimestamp(block.timestamp)}</Th>
                      <Th>
                        <Tag colorScheme={"blue"}>{block.starknet_version}</Tag>
                      </Th>
                      <Th>
                        <Tag colorScheme={"blue"}>{block.l1_da_mode}</Tag>
                      </Th>
                    </Tr>
                  ))
                )}
                {data?.rows.length < pageSize && (
                  <Tr>
                    <Th colSpan={6} textAlign="center">
                      Fewer blocks available than requested.
                    </Th>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </TableContainer>
          <Paginator
            pageNumber={pageNumber}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            totalPages={totalPages ? totalPages : -1}
          />
        </Stack>
      )}
    </Stack>
  );
};

export default Blocks;
