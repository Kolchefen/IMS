import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function RestoreInventory() {
  return (
    <div className="p-8 flex justify-center">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Restore Inventory with Manifest Report</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div>
            <p className="mb-2 text-gray-700">
              Use this tool to restore your inventory to a previous state using a manifest report. Upload a manifest file to preview the changes that will be made to your inventory. Once reviewed, you can apply the changes to update your inventory records.
            </p>
          <div className="border border-dashed border-gray-300 rounded p-8 text-center mb-2 flex flex-col items-center gap-4">
            <Button asChild className="w-full">
              <span>Browse Files</span>
            </Button>
            <div className="text-gray-400 mb-2">No file selected</div>
          </div>
          </div>
          <Button className="w-full text-lg" disabled>
            Restore Inventory
          </Button>
        </CardContent>
      </Card>
    </div>
    );
}
