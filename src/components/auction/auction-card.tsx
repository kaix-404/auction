import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateOnly } from "@/lib/utils";
import { CountdownTimer } from "@/components/auction/countdown";

interface AuctionCardData {
  _id: string;
  title: string;
  productId?: {
    images?: string[];
    brand?: string;
    model?: string;
    condition?: string;
  } | null;
  currentBidAmount: number;
  reservePrice: number;
  bidIncrement: number;
  status: string;
  endDate: string;
  isFeatured?: boolean;
}

export function AuctionCard({ auction }: { auction: AuctionCardData }) {
  const image =
    (auction.productId?.images && auction.productId.images[0]) || null;
  const isLive = auction.status === "live" || auction.status === "registration_open";

  return (
    <Link href={`/auctions/${auction._id}`} className="block">
      <Card className="group h-full overflow-hidden border-2 border-foreground bg-card transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg">
        <div className="relative h-44 w-full bg-muted">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={auction.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          <div className="absolute left-2 top-2 flex gap-2">
            <Badge variant={isLive ? "destructive" : "secondary"}>
              {isLive ? "LIVE" : auction.status.toUpperCase()}
            </Badge>
            {auction.isFeatured && <Badge variant="default">Featured</Badge>}
          </div>
          <div className="absolute right-2 top-2">
            <CountdownTimer endDate={auction.endDate} />
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="line-clamp-2 font-semibold leading-tight">
            {auction.title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {auction.productId?.brand || "Brand"}
            {auction.productId?.model ? ` ${auction.productId.model}` : ""}
            {" · "}
            {auction.productId?.condition || "condition"}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Current bid</p>
              <p className="text-lg font-bold text-primary">
                {formatCurrency(auction.currentBidAmount || 0)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Next bid</p>
              <p className="font-medium">
                {formatCurrency((auction.currentBidAmount || 0) + auction.bidIncrement)}
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t px-4 py-3">
          <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
            <span>Ends {formatDateOnly(auction.endDate)}</span>
            <span className="font-medium text-primary">View &rarr;</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
