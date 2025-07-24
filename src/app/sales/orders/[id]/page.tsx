// src/app/sales/orders/[id]/page.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Order, FulfillmentStatus, PaymentStatus } from '@/types/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import {
  Loader2,
  ArrowLeft,
  User,
  Phone,
  Mail,
  Home,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  Sparkles,
  XCircle,
  Receipt,
  DollarSign,
  PlusCircle,
} from 'lucide-react';
import { AddPaymentDialog } from '@/components/shared/AddPaymentDialog';
import { updateFulfillmentStatus } from '@/services/orderService';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const getFulfillmentStatusInfo = (status: FulfillmentStatus) => {
    switch (status) {
      case 'completed': return { variant: 'default', text: 'Entregado', icon: CheckCircle2 };
      case 'processing': return { variant: 'secondary', text: 'En Curso', icon: Clock };
      case 'finishing': return { variant: 'outline', text: 'Por Terminar', icon: Sparkles };
      case 'cancelled': return { variant: 'destructive', text: 'Cancelado', icon: XCircle };
      case 'pending': default: return { variant: 'secondary', text: 'Pendiente', icon: Clock };
    }
};
  
const getPaymentStatusInfo = (status: PaymentStatus) => {
    switch (status) {
        case 'paid': return { variant: 'default', text: 'Pagado', color: 'bg-green-100 text-green-800' };
        case 'partially-paid': return { variant: 'outline', text: 'Pago Parcial', color: 'bg-amber-100 text-amber-800' };
        case 'unpaid': default: return { variant: 'destructive', text: 'No Pagado', color: 'bg-red-100 text-red-800' };
    }
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { toast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  useEffect(() => {
    if (!orderId) {
        setLoading(false);
        return;
    };
    const unsub = onSnapshot(doc(db, 'orders', orderId), (doc) => {
      if (doc.exists()) {
        setOrder({ id: doc.id, ...doc.data() } as Order);
      } else {
        console.error("No such order!");
      }
      setLoading(false);
    });
    return () => unsub();
  }, [orderId]);
  
  const handleUpdateStatus = async (status: FulfillmentStatus) => {
    try {
        await updateFulfillmentStatus(orderId, status);
        toast({ title: 'Estado Actualizado', description: 'El estado de preparación del pedido ha sido actualizado.'});
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  }

  const {
    fulfillmentStatusInfo,
    paymentStatusInfo,
    paymentDetails,
    isPaid,
    subtotal,
    amountDue
  } = useMemo(() => {
    if (!order) {
      return {
        fulfillmentStatusInfo: null,
        paymentStatusInfo: null,
        paymentDetails: [],
        isPaid: false,
        subtotal: 0,
        amountDue: 0,
      };
    }
    const currentAmountDue = (order.totalAmount || 0) - (order.amountPaid || 0);

    return {
      fulfillmentStatusInfo: getFulfillmentStatusInfo(order.fulfillmentStatus),
      paymentStatusInfo: getPaymentStatusInfo(order.paymentStatus),
      paymentDetails: order.paymentDetails || [],
      isPaid: order.paymentStatus === 'paid',
      subtotal: order.items.reduce((acc, item) => acc + item.price * item.quantity, 0),
      amountDue: currentAmountDue,
    };
  }, [order]);


  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin" /></div>;
  }

  if (!order) {
    return <div className="text-center py-10">Pedido no encontrado.</div>;
  }
  
  return (
    <TooltipProvider>
    <div className="space-y-6">
       <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Pedidos
        </Button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Pedido #{order.id.substring(0, 7)}</CardTitle>
                    <CardDescription>
                    Creado el: {new Intl.DateTimeFormat('es-PE', { dateStyle: 'long', timeStyle: 'short' }).format(order.createdAt.toDate())}
                    </CardDescription>
                </div>
                 <div className="flex gap-2">
                    {paymentStatusInfo && <Badge className={paymentStatusInfo.color}>{paymentStatusInfo.text}</Badge>}
                    {fulfillmentStatusInfo && <Badge variant={fulfillmentStatusInfo.variant}>{fulfillmentStatusInfo.text}</Badge>}
                </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead className="text-right">Precio Unitario</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Image src={item.image || '/placeholder.svg'} alt={item.name} width={48} height={48} className="rounded-md object-cover" />
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="text-right">S/{item.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">S/{(item.price * item.quantity).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
              <CardHeader>
                  <CardTitle>Pagos Registrados</CardTitle>
              </CardHeader>
              <CardContent>
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Fecha</TableHead>
                              <TableHead>Método</TableHead>
                              <TableHead className="text-right">Monto</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                           {paymentDetails.length === 0 && (
                               <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No hay pagos registrados.</TableCell></TableRow>
                           )}
                          {paymentDetails.map((p, i) => (
                            <TableRow key={i}>
                                <TableCell>{new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(p.date.toDate())}</TableCell>
                                <TableCell className="capitalize">{p.method}</TableCell>
                                <TableCell className="text-right">S/{p.amount.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                  </Table>
              </CardContent>
              <CardFooter className="flex justify-end">
                  <Button onClick={() => setIsPaymentDialogOpen(true)} disabled={order.paymentStatus === 'paid'}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Añadir Pago
                  </Button>
              </CardFooter>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2"><DollarSign />Resumen Financiero</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                  <div className="flex justify-between"><span>Subtotal:</span><span>S/{subtotal.toFixed(2)}</span></div>
                   {order.shippingCost && order.shippingCost > 0 && (
                      <div className="flex justify-between"><span>Envío:</span><span>S/{order.shippingCost.toFixed(2)}</span></div>
                  )}
                  <div className="flex justify-between font-semibold"><span>Total Pedido:</span><span>S/{order.totalAmount?.toFixed(2) ?? '0.00'}</span></div>
                  <Separator/>
                  <div className="flex justify-between"><span>Monto Pagado:</span><span className="font-semibold text-green-600">S/{order.amountPaid?.toFixed(2) ?? '0.00'}</span></div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg"><span>Saldo Pendiente:</span><span className="text-red-600">S/{amountDue.toFixed(2)}</span></div>
              </CardContent>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Truck />Estado del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant={order.fulfillmentStatus === 'processing' ? 'default' : 'secondary'} onClick={() => handleUpdateStatus('processing')}><Clock className="mr-2"/>En Curso</Button>
                <Button className="w-full justify-start" variant={order.fulfillmentStatus === 'finishing' ? 'default' : 'secondary'} onClick={() => handleUpdateStatus('finishing')}><Sparkles className="mr-2"/>Por Terminar</Button>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="w-full">
                            <Button className="w-full justify-start" variant={order.fulfillmentStatus === 'completed' ? 'default' : 'secondary'} onClick={() => handleUpdateStatus('completed')} disabled={!isPaid}>
                                <CheckCircle2 className="mr-2"/>Terminado y Entregado
                            </Button>
                        </div>
                    </TooltipTrigger>
                    {!isPaid && (
                        <TooltipContent>
                            <p>El pedido debe estar pagado para marcarlo como entregado.</p>
                        </TooltipContent>
                    )}
                 </Tooltip>
                <Separator />
                <Button className="w-full justify-start" variant='destructive' onClick={() => handleUpdateStatus('cancelled')}><XCircle className="mr-2"/>Cancelar Pedido</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User />Información del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex items-center gap-3">
                <Package className="text-muted-foreground" />
                <Link href={`/sales/customers/${order.userId}`} className="font-semibold hover:underline">{order.customerInfo.name}</Link>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-muted-foreground" />
                <span>{order.customerInfo.email || 'No registrado'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-muted-foreground" />
                <span>{order.customerInfo.phone || 'No registrado'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Home className="text-muted-foreground" />
                <span>{order.customerInfo.address || 'No registrada'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    <AddPaymentDialog
        isOpen={isPaymentDialogOpen}
        setIsOpen={setIsPaymentDialogOpen}
        orderId={orderId}
        amountDue={amountDue}
    />
    </TooltipProvider>
  );
}
